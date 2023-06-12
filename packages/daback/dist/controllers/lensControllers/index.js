"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    urqlClient: function() {
        return urqlClient;
    },
    signedTypeData: function() {
        return signedTypeData;
    },
    setAccessToken: function() {
        return setAccessToken;
    },
    isTokenExpired: function() {
        return isTokenExpired;
    },
    login: function() {
        return login;
    },
    broadcast: function() {
        return broadcast;
    },
    searchProfiles: function() {
        return searchProfiles;
    },
    searchPublications: function() {
        return searchPublications;
    },
    authorization: function() {
        return authorization;
    },
    refresh: function() {
        return refresh;
    },
    authentication: function() {
        return authentication;
    },
    sign: function() {
        return sign;
    },
    create: function() {
        return create;
    },
    postGaslessData: function() {
        return postGaslessData;
    },
    createPostGasless: function() {
        return createPostGasless;
    },
    createPost: function() {
        return createPost;
    }
});
const _querys = require("./querys.js");
const _path = _interop_require_default(require("path"));
const _ethers = _interop_require_default(require("ethers"));
const _urql = require("urql");
const _crossfetch = _interop_require_default(require("cross-fetch"));
const _dotenv = _interop_require_default(require("dotenv"));
const _index = require("../ipfs.js/index.js");
const _uuid = require("uuid");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const { config  } = _dotenv.default;
config();
const serverAddress = process.env.SERVER_WALLET_ADDRESS;
const privateKey = process.env.SERVER_PRIVATE_KEY;
let accessToken = process.env.ACCESS_TOKEN;
const APIURL = 'https://api-mumbai.lens.dev/';
const urqlClient = (0, _urql.createClient)({
    url: APIURL,
    fetch: async (url, options)=>{
        options.headers['x-access-token'] = accessToken;
        return (0, _crossfetch.default)(url, options);
    },
    fetchOptions: {
        headers: {}
    }
});
const provider = new _ethers.default.ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
const signer = new _ethers.default.Wallet(privateKey, provider);
const address = signer.address;
let accessTokenExpiration = Number(process.env.ACCESS_TOKEN_EXPIRATION);
let refreshToken = null;
let tokenExpiry = null;
const urlValidator = (req, res, next)=>{
    const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;
    const { url  } = req.body;
    if (!urlRegex.test(url)) {
        return res.status(400).json({
            error: 'Invalid URL format.'
        });
    }
    next();
};
const signedTypeData = async (domain, types, value)=>{
    const result = await signer._signTypedData(omit(domain, '__typename'), omit(types, '__typename'), omit(value, '__typename'));
    return result;
};
const setAccessToken = (token, expiry)=>{
    accessToken = token;
    tokenExpiry = expiry;
    console.log('Access token set: ', accessToken, expiry);
};
const isTokenExpired = ()=>{
    if (!tokenExpiry) return true;
    const currentTime = Math.floor(new Date().getTime() / 1000);
    return currentTime > tokenExpiry;
};
const login = async ()=>{
    try {
        if (!serverAddress || !privateKey) {
            throw new Error('Missing environment variables');
        }
        const challengeInfo = await urqlClient.query(_querys.challenge, {
            address: address
        }).toPromise();
        const signature = await signer.signMessage(challengeInfo.data.challenge.text);
        const authData = await urqlClient.mutation(_querys.authenticate, {
            address: address,
            signature
        }).toPromise();
        if (authData.error) {
            throw new Error(authData.error.message);
        }
        const { data: { authenticate: { accessToken: newToken , expiresAt  }  }  } = authData;
        accessTokenExpiration = expiresAt * 1000;
        setAccessToken(newToken, accessTokenExpiration);
        return newToken;
    } catch (err) {
        console.log('Error signing in: ', err);
        throw err;
    }
};
const broadcast = async (req, res)=>{
    try {
        const { text: text  } = req.body;
        console.log('follow with broadcast: address', address);
        const result = await urqlClient.mutation(_querys.createPostRequest, {
            text
        }).toPromise();
        console.log('follow with broadcast: result', result);
        const typedData = result.typedData;
        console.log('follow with broadcast: typedData', typedData);
        const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
        console.log('follow with broadcast: signature', signature);
        const broadcastResult = await broadcastRequest({
            id: result.id,
            signature
        });
        console.log('follow with broadcast: broadcastResult', broadcastResult);
        if (broadcastResult.__typename !== 'RelayerResult') {
            console.error('follow with broadcast: failed', broadcastResult);
            throw new Error('follow with broadcast: failed');
        }
        console.log('follow with broadcast: poll until indexed');
        const indexedResult = await pollUntilIndexed({
            txId: broadcastResult.txId
        });
        console.log('follow with broadcast: has been indexed', result);
        const logs = indexedResult.txReceipt.logs;
        console.log('follow with broadcast: logs', logs);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({
            error: error.toString()
        });
    }
};
const searchProfiles = async (req, res)=>{
    const { query  } = req.params;
    console.log(query);
    const response = await urqlClient.query(_querys.searchProfilesQuery, {
        query
    }).toPromise();
    res.json(response.data.search.items);
    console.log(response.data.search.items);
};
const searchPublications = async (req, res)=>{
    const { query  } = req.params;
    console.log(query);
    const response = await urqlClient.query(_querys.searchPublicationsQuery, {
        query
    }).toPromise();
    res.json(response.data.search.items);
    console.log(response.data.search.items);
};
const authorization = async (req, res)=>{
    const response = await urqlClient.query(_querys.challangeQuery).toPromise();
    res.json(response.data.challenge.text);
    console.log(response.data.challenge.text);
};
const refresh = async ()=>{
    const variables = {
        refreshToken
    };
    try {
        const response = await urqlClient.mutation(refreshMutation, variables).toPromise();
        if (response.error) {
            console.error('Refresh token error: ', response.error);
            throw new Error('Error refreshing token: ' + response.error.message);
        }
        const newAccessToken = response.data.refresh.accessToken;
        const newRefreshToken = response.data.refresh.refreshToken;
        const expiresIn = response.data.refresh.expiresIn;
        const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;
        refreshToken = newRefreshToken;
    } catch (err) {
        console.error('Error in refresh function: ', err);
        throw err;
    }
};
(async function initializeRefresh() {
    try {
        const loginResponse = await login();
        accessToken = loginResponse.accessToken;
        refreshToken = loginResponse.refreshToken;
        setInterval(refresh, 60 * 60 * 1000);
    } catch (error) {
        console.log('Error initializing refresh:', error);
    }
})();
const authentication = async (req, res)=>{
    const body = req.body;
    console.log(body);
    const response = await urqlClient.mutation(_querys.authenticationQuery).toPromise();
    res.json(response);
    console.log(response);
};
const sign = (req, res)=>{
    res.sendFile(_path.default.resolve("./public/index.html"));
};
const create = async (req, res)=>{
    const body = req.body;
    console.log(body);
    const response = await urqlClient.mutation(_querys.createProfuileQuery, _object_spread({}, body)).toPromise();
    res.json(response);
};
const postGaslessData = async (req, res)=>{
    try {
        const body = req.body;
        console.log(body);
        const response = await urqlClient.mutation(_querys.createPostRequest, _object_spread({}, body)).toPromise();
        console.log('create post via dispatcher: createPostViaDispatcherRequest', response);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'An error occurred'
        });
    }
};
const createPostGasless = async ()=>{
    const prefix = 'create post gasless';
    const profileId = process.env.PROFILE_ID;
    if (!profileId) {
        throw new Error('Must define PROFILE_ID in the .env to run this');
    }
    const address = fakeAddress;
    console.log(`${prefix}: address`, address);
    const ipfsResult = await (0, _index.uploadIpfsGetPath)({
        version: '2.0.0',
        metadata_id: (0, _uuid.v4)(),
        description: 'Description',
        locale: 'en-US',
        content: '@wagmi.test',
        external_url: null,
        image: null,
        imageMimeType: null,
        name: 'Name',
        attributes: [],
        tags: [
            'using_api_examples'
        ],
        appId: 'api_examples_github'
    });
    console.log(`${prefix}: ipfs result`, ipfsResult);
    const result = await postGasless(_querys.createPostRequest);
    console.log(prefix, result);
};
const createPost = async (req, res)=>{
    try {
        const body = req.body;
        console.log(body);
        const response = await urqlClient.mutation(_querys.createPostRequest, _object_spread({}, body)).toPromise();
        res.json(response);
        console.log(response, "response");
    } catch (err) {
        console.log('Error creating post: ', err);
        res.status(500).json({
            error: 'Error creating post: ' + err.message
        });
    }
};

//# sourceMappingURL=index.js.map