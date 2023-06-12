import { 
  authenticationQuery, 
  authenticate,
  challangeQuery, 
  challenge,
  createProfuileQuery, 
  createPostRequest,
  refreshQuery, 
  searchProfilesQuery, 
  searchPublicationsQuery
} from "./querys.js";
import path from "path";
import ethers from "ethers";
import { createClient } from "urql";
import fetch from "cross-fetch";
import dotenv from "dotenv";
import {uploadIpfsGetPath} from "../ipfs.js/index.js";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
const { config } = dotenv;
config();


const serverAddress = process.env.SERVER_WALLET_ADDRESS;
const privateKey = process.env.SERVER_PRIVATE_KEY;
let accessToken = process.env.ACCESS_TOKEN;
const APIURL = 'https://api-mumbai.lens.dev/';

export const urqlClient = createClient({
  url: APIURL,
  fetch: async (url, options) => {
    options.headers['x-access-token'] = accessToken;
    return fetch(url, options);
  },
  fetchOptions: {
    headers: {
      // other headers...
    }
  }
});


const provider = new ethers.ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
const signer = new ethers.Wallet(privateKey, provider);
const address = signer.address;

let accessTokenExpiration = Number(process.env.ACCESS_TOKEN_EXPIRATION);
let refreshToken = null;
let tokenExpiry = null;

const urlValidator = (req, res, next) => {
const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;

const { url } = req.body;

if (!urlRegex.test(url)) {
  return res.status(400).json({ error: 'Invalid URL format.' });
}

next();
};

export const signedTypeData = async (
  domain,
  types,
  value
) => {
  // remove the __typedname from the signature!
  const result = await signer._signTypedData(
    omit(domain, '__typename'),
    omit(types, '__typename'),
    omit(value, '__typename')
  );

  // console.log('typed data - domain', omit(domain, '__typename'));
  // console.log('typed data - types', omit(types, '__typename'));
  // console.log('typed data - value', omit(value, '__typename'));
  // console.log('typed data - signature', result);

  // const whoSigned = utils.verifyTypedData(
  //   omit(domain, '__typename'),
  //   omit(types, '__typename'),
  //   omit(value, '__typename'),
  //   result
  // );
  // console.log('who signed', whoSigned);

  return result;
};


export const setAccessToken = (token, expiry) => {
    accessToken = token;
    tokenExpiry = expiry;
    console.log('Access token set: ', accessToken, expiry);
};

export const isTokenExpired = () => {
    if (!tokenExpiry) return true;
    const currentTime = Math.floor(new Date().getTime() / 1000);
    return currentTime > tokenExpiry;
}

export const login = async () => {
  try {
    if (!serverAddress || !privateKey) {
      throw new Error('Missing environment variables');
    }


    const challengeInfo = await urqlClient.query(challenge, {
        address: address
    }).toPromise();

    const signature = await signer.signMessage(challengeInfo.data.challenge.text);

    const authData = await urqlClient.mutation(authenticate, {
        address: address,
        signature
    }).toPromise();

    if (authData.error) {
        throw new Error(authData.error.message);
    }

    const { data: { authenticate: { accessToken: newToken, expiresAt }}} = authData;
    accessTokenExpiration = expiresAt * 1000;

    // Returns the access token
    setAccessToken(newToken, accessTokenExpiration);
    return newToken;
  } catch (err) {
    console.log('Error signing in: ', err);
    throw err;
  }
}

export const broadcast = async (req, res) => {
  try {

  const { text: text } = req.body;

  console.log('follow with broadcast: address', address);

  const result = await urqlClient.mutation(createPostRequest, { text }).toPromise();
  console.log('follow with broadcast: result', result);

  const typedData = result.typedData;
  console.log('follow with broadcast: typedData', typedData);

  const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
  console.log('follow with broadcast: signature', signature);

  const broadcastResult = await broadcastRequest({
    id: result.id,
    signature,
  });

  console.log('follow with broadcast: broadcastResult', broadcastResult);
  if (broadcastResult.__typename !== 'RelayerResult') {
    console.error('follow with broadcast: failed', broadcastResult);
    throw new Error('follow with broadcast: failed');
  }

  console.log('follow with broadcast: poll until indexed');
  const indexedResult = await pollUntilIndexed({ txId: broadcastResult.txId });

  console.log('follow with broadcast: has been indexed', result);

  const logs = indexedResult.txReceipt.logs;

  console.log('follow with broadcast: logs', logs);
} catch (error) {
  console.error('An error occurred:', error);
  // Handle the error, for example send a response with error status
  res.status(500).send({ error: error.toString() });
}
}

export const searchProfiles = async (req, res) => {
  const { query } = req.params;
  console.log(query);

  const response = await urqlClient.query(searchProfilesQuery, { query }).toPromise();

  res.json(response.data.search.items);
  console.log(response.data.search.items);
}

export const searchPublications = async (req, res) => {
  const { query } = req.params;
  console.log(query);

  const response = await urqlClient.query(searchPublicationsQuery, { query }).toPromise();

  res.json(response.data.search.items);
  console.log(response.data.search.items);
}

export const authorization = async (req, res) => {
  const response = await urqlClient.query(challangeQuery).toPromise();

  res.json(response.data.challenge.text);
  console.log(response.data.challenge.text);
}

export const refresh = async () => {
  const variables = { refreshToken };

  try {
      const response = await urqlClient.mutation(refreshMutation, variables).toPromise();

      // Check if there was an error
      if (response.error) {
          console.error('Refresh token error: ', response.error);
          throw new Error('Error refreshing token: ' + response.error.message);
      }

      // If no error, update accessToken, refreshToken and expiry
      const newAccessToken = response.data.refresh.accessToken;
      const newRefreshToken = response.data.refresh.refreshToken;
      // Assuming you get `expiresIn` in the response which is the time in seconds for the token to expire.
      const expiresIn = response.data.refresh.expiresIn;
      const expiryTime = Math.floor(Date.now() / 1000) + expiresIn; // Current Unix timestamp + expiresIn

      // Set the accessToken, refreshToken and expiry in the store


      // Also update the refreshToken for subsequent refresh calls.
      refreshToken = newRefreshToken;
  } catch (err) {
      console.error('Error in refresh function: ', err);
      throw err;
  }
};

// Initialize refresh function
(async function initializeRefresh() {
  try {
      // Call the login function to get initial tokens
      const loginResponse = await login(); // Assume login function return tokens
      accessToken = loginResponse.accessToken;
      refreshToken = loginResponse.refreshToken;

      // Set interval to refresh tokens every hour
      setInterval(refresh, 60 * 60 * 1000);
  } catch (error) {
      console.log('Error initializing refresh:', error);
  }
})();

export const authentication = async (req, res) => {
  const body = req.body;
  console.log(body);

  const response = await urqlClient.mutation(authenticationQuery).toPromise();

  res.json(response);
  console.log(response);
}

export const sign = (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
}

export const create = async (req, res) => {
  const body = req.body;
  console.log(body);

  const response = await urqlClient.mutation(createProfuileQuery, { ...body }).toPromise();


res.json(response);
}

export const postGaslessData = async (req, res) => {
try{
    const body = req.body;
    console.log(body);

    const response = await urqlClient.mutation(createPostRequest, { ...body }).toPromise();
    console.log('create post via dispatcher: createPostViaDispatcherRequest', response);
    res.json(response);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

export const createPostGasless = async () => {
  const prefix = 'create post gasless';
  const profileId = process.env.PROFILE_ID;
 
  if (!profileId) {
    throw new Error('Must define PROFILE_ID in the .env to run this');
  }

  const address = fakeAddress;
  console.log(`${prefix}: address`, address);

  const ipfsResult = await uploadIpfsGetPath({
    version: '2.0.0',
    metadata_id: uuidv4(),
    description: 'Description',
    locale: 'en-US',
    content: '@wagmi.test',
    external_url: null,
    image: null,
    imageMimeType: null,
    name: 'Name',
    attributes: [],
    tags: ['using_api_examples'],
    appId: 'api_examples_github',
  });

  console.log(`${prefix}: ipfs result`, ipfsResult);

  // hard coded to make the code example clear


  const result = await postGasless(createPostRequest);
  console.log(prefix, result);

  // await pollAndIndexPost(result.txHash, profileId, prefix);
};

// export const pollAndIndexPost = async (txHash, profileId, prefix) => {
//   console.log(`${prefix}: poll until indexed`);
//   const indexedResult = await pollUntilIndexed({ txHash });

//   console.log(`${prefix}: profile has been indexed`);

//   const logs = indexedResult.txReceipt.logs;

//   console.log(`${prefix}: logs`, logs);

//   const topicId = utils.id(
//     'PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)'
//   );
//   console.log('topicid we care about', topicId);

//   const profileCreatedLog = logs.find((l) => l.topics[0] === topicId);
//   console.log(`${prefix}: created log`, profileCreatedLog);

//   let profileCreatedEventLog = profileCreatedLog.topics;
//   console.log(`${prefix}: created event logs`, profileCreatedEventLog);

//   const publicationId = ethers.utils.defaultAbiCoder.decode(['uint256'], profileCreatedEventLog[2])[0];

//   const contractPublicationId = ethers.BigNumber.from(publicationId).toHexString();

//   const internalPublicationId = profileId + '-' + contractPublicationId;

//   console.log(`${prefix}: contract publication id`, contractPublicationId);
//   console.log(`${prefix}: internal publication id`, internalPublicationId);
//   return internalPublicationId;
// };


export const createPost =  async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    
    // Include accessToken in the headers for the mutation request.
    const response = await urqlClient.mutation(
      createPostRequest, 
      { ...body },
    ).toPromise();

    res.json(response);
    console.log(response, "response");
  } catch (err) {
    console.log('Error creating post: ', err);
    res.status(500).json({ error: 'Error creating post: ' + err.message });
  }
};
