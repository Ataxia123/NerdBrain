import { createClient } from 'urql';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
const { config } = dotenv;
config();

// const serverAddress = process.env.SERVER_WALLET_ADDRESS;
// const privateKey = process.env.SERVER_PRIVATE_KEY;
// let accessToken = process.env.ACCESS_TOKEN;
// const APIURL = 'https://api-mumbai.lens.dev/';
// const provider = new ethers.ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
// const signer = new ethers.Wallet(privateKey, provider);
// const address = signer.address;

// let accessTokenExpiration = Number(process.env.ACCESS_TOKEN_EXPIRATION);
// let refreshToken = null;
// let tokenExpiry = null;

// export const urqlClient = createClient({
//   url: APIURL,
//   fetch: async (url, options) => {
//     options.headers['x-access-token'] = accessToken;
//     return fetch(url, options);
//   },
//   fetchOptions: {
//     headers: {
//       // other headers...
//     },
//   },
// });

export async function login() {
  console.log('Logging in...');
  // try {
  //   if (!serverAddress || !privateKey) {
  //     throw new Error('Missing environment variables');
  //   }
  //   const challengeInfo = await urqlClient
  //     .query(challenge, {
  //       address: address,
  //     })
  //     .toPromise();
  //   const signature = await signer.signMessage(challengeInfo.data.challenge.text);
  //   const authData = await urqlClient
  //     .mutation(authenticate, {
  //       address: address,
  //       signature,
  //     })
  //     .toPromise();
  //   if (authData.error) {
  //     throw new Error(authData.error.message);
  //   }
  //   const {
  //     data: {
  //       authenticate: { accessToken: newToken, expiresAt },
  //     },
  //   } = authData;
  //   accessTokenExpiration = expiresAt * 1000;
  //   // Returns the access token
  //   setAccessToken(newToken, accessTokenExpiration);
  //   return newToken;
  // } catch (err) {
  //   console.log('Error signing in: ', err);
  //   throw err;
  // }
}

// export const setAccessToken = (token, expiry) => {
//   accessToken = token;
//   tokenExpiry = expiry;
//   console.log('Access token set: ', accessToken, expiry);
// };
