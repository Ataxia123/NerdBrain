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
    challangeQuery: function() {
        return challangeQuery;
    },
    authenticationQuery: function() {
        return authenticationQuery;
    },
    searchProfilesQuery: function() {
        return searchProfilesQuery;
    },
    searchPublicationsQuery: function() {
        return searchPublicationsQuery;
    },
    createProfuileQuery: function() {
        return createProfuileQuery;
    },
    createPostRequest: function() {
        return createPostRequest;
    },
    refreshQuery: function() {
        return refreshQuery;
    },
    challenge: function() {
        return challenge;
    },
    authenticate: function() {
        return authenticate;
    },
    createPostQuery: function() {
        return createPostQuery;
    },
    dispatchPost: function() {
        return dispatchPost;
    }
});
const challangeQuery = `
    query Challenge {
        challenge(request: { address: "0xE6f3a0fF3b2Ef23ca6Bc8167F94efCe2e4E62aa2" }) {
            text
        }
    }
`;
const authenticationQuery = `
    mutation Authenticate {
        authenticate(request: {
            address: "0xE6f3a0fF3b2Ef23ca6Bc8167F94efCe2e4E62aa2",
            signature: "0x9f3f60ab4b8165769b6fbe3ac9ae0291753c6023b641eb52500dde4166d1ca0b5fbe089c913e9824776d0215237be34adaa86ce8d17fec999bc95e80065acf631c"
        }) {
            accessToken
            refreshToken
        }
    }
`;
const searchProfilesQuery = `
    query Search($query: Search!) {
        search(request: {
            query: $query,
            type: PROFILE,
            limit: 10
        }) {
            ... on ProfileSearchResult {
                __typename 
                items {
                ... on Profile {
                    ...ProfileFields
                }
                }
                pageInfo {
                prev
                totalCount
                next
                }
            }
        }
    }
    
    fragment MediaFields on Media {
        url
        mimeType
    }
    
    fragment ProfileFields on Profile {
        profileId: id,
        name
        bio
        attributes {
            displayType
            traitType
            key
            value
        }
        isFollowedByMe
        isFollowing(who: null)
        followNftAddress
        metadata
        isDefault
        handle
        picture {
            ... on NftImage {
                contractAddress
                tokenId
                uri
                verified
            }
            ... on MediaSet {
                original {
                ...MediaFields
                }
            }
        }
        coverPicture {
            ... on NftImage {
                contractAddress
                tokenId
                uri
                verified
            }
            ... on MediaSet {
                original {
                ...MediaFields
                }
            }
        }
        ownedBy
        dispatcher {
            address
        }
        stats {
            totalFollowers
            totalFollowing
            totalPosts
            totalComments
            totalMirrors
            totalPublications
            totalCollects
        }
        followModule {
            ... on FeeFollowModuleSettings {
                type
                amount {
                    asset {
                        name
                        symbol
                        decimals
                        address
                    }
                    value
                }
                recipient
            }
            ... on ProfileFollowModuleSettings {
                type
                contractAddress
            }
            ... on RevertFollowModuleSettings {
                type
                contractAddress
            }
            ... on UnknownFollowModuleSettings {
                type
                contractAddress
                followModuleReturnData
            }
        }
    }
`;
const searchPublicationsQuery = `
query Search {
    search(request: {
      query: "hello",
      type: PUBLICATION,
      limit: 10
    }) {
      ... on PublicationSearchResult {
         __typename 
        items {
          __typename 
          ... on Comment {
            ...CommentFields
          }
          ... on Post {
            ...PostFields
          }
        }
        pageInfo {
          prev
          totalCount
          next
        }
      }
      ... on ProfileSearchResult {
        __typename 
        items {
          ... on Profile {
            ...ProfileFields
          }
        }
        pageInfo {
          prev
          totalCount
          next
        }
      }
    }
  }
  
  fragment MediaFields on Media {
    url
    mimeType
  }
  
  fragment MirrorBaseFields on Mirror {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ...ReferenceModuleFields
    }
    appId
  }
  
  fragment ProfileFields on Profile {
    profileId: id,
    name
    bio
    attributes {
       displayType
       traitType
       key
       value
    }
    isFollowedByMe
    isFollowing(who: null)
    metadataUrl: metadata
    isDefault
    handle
    picture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          ...MediaFields
        }
      }
    }
    coverPicture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          ...MediaFields
        }
      }
    }
    ownedBy
    dispatcher {
      address
    }
    stats {
      totalFollowers
      totalFollowing
      totalPosts
      totalComments
      totalMirrors
      totalPublications
      totalCollects
    }
    followModule {
      ...FollowModuleFields
    }
  }
  
  fragment PublicationStatsFields on PublicationStats { 
    totalAmountOfMirrors
    totalAmountOfCollects
    totalAmountOfComments
  }
  
  fragment MetadataOutputFields on MetadataOutput {
    name
    description
    content
    media {
      original {
        ...MediaFields
      }
    }
    attributes {
      displayType
      traitType
      value
    }
  }
  
  fragment Erc20Fields on Erc20 {
    name
    symbol
    decimals
    address
  }
  
  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ...ReferenceModuleFields
    }
    appId
    hidden
    reaction(request: null)
    mirrors(by: null)
    hasCollectedByMe
  }
  
  fragment CommentBaseFields on Comment {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ...ReferenceModuleFields
    }
    appId
    hidden
    reaction(request: null)
    mirrors(by: null)
    hasCollectedByMe
  }
  
  fragment CommentFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
        ...MirrorBaseFields
        mirrorOf {
          ... on Post {
             ...PostFields          
          }
          ... on Comment {
             ...CommentMirrorOfFields        
          }
        }
      }
    }
  }
  
  fragment CommentMirrorOfFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
         ...MirrorBaseFields
      }
    }
  }
  
  fragment FollowModuleFields on FollowModule {
    ... on FeeFollowModuleSettings {
      type
      amount {
        asset {
          name
          symbol
          decimals
          address
        }
        value
      }
      recipient
    }
    ... on ProfileFollowModuleSettings {
      type
      contractAddress
    }
    ... on RevertFollowModuleSettings {
      type
      contractAddress
    }
    ... on UnknownFollowModuleSettings {
      type
      contractAddress
      followModuleReturnData
    }
  }
  
  fragment CollectModuleFields on CollectModule {
    __typename
    ... on FreeCollectModuleSettings {
      type
      followerOnly
      contractAddress
    }
    ... on FeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedTimedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
    ... on RevertCollectModuleSettings {
      type
    }
    ... on TimedFeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
    ... on UnknownCollectModuleSettings {
      type
      contractAddress
      collectModuleReturnData
    }
  }
  
  fragment ReferenceModuleFields on ReferenceModule {
    ... on FollowOnlyReferenceModuleSettings {
      type
      contractAddress
    }
    ... on UnknownReferenceModuleSettings {
      type
      contractAddress
      referenceModuleReturnData
    }
    ... on DegreesOfSeparationReferenceModuleSettings {
      type
      contractAddress
      commentsRestricted
      mirrorsRestricted
      degreesOfSeparation
    }
}
`;
const createProfuileQuery = `
    mutation CreateProfile(
        $handle: CreateHandle!,
        $profilePictureUri: Url!
        ){
        createProfile(request:{ 
                        handle: $handle,
                        profilePictureUri: $profilePictureUri,
                        followNFTURI: null,
                        followModule: {
                            freeFollowModule: true   
                        }
                    }) {
        ... on RelayerResult {
            txHash
        }
        ... on RelayError {
            reason
        }
        __typename
        }
    }
`;
const createPostRequest = `
mutation CreatePostTypedData {
  createPostTypedData(request: {
    profileId: "0x856d",
    contentURI: "ipfs://QmPogtffEF3oAbKERsoR4Ky8aTvLgBF5totp5AuF8YN6vl",
    collectModule: {
      revertCollectModule: true
    },
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  }) {
    id
    expiresAt
    typedData {
      types {
        PostWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleInitData
        referenceModule
        referenceModuleInitData
      }
    }
  }
}`;
const refreshQuery = `
mutation Refresh($refreshToken: String!) {
  refresh(request: { refreshToken: $refreshToken }) {
    accessToken
    refreshToken
  }
}
`;
const challenge = `
query Challenge($address: EthereumAddress!) {
  challenge(request: { address: $address }) {
    text
  }
}
`;
const authenticate = `
  mutation Authenticate(
    $address: EthereumAddress!
    $signature: Signature!
  ) {
    authenticate(request: {
      address: $address,
      signature: $signature
    }) {
      accessToken
      refreshToken
    }
  }`;
const createPostQuery = `
  mutation CreatePostTypedData {
  createPostTypedData(request: {
    profileId: "0x03",
    contentURI: "ipfs://QmPogtffEF3oAbKERsoR4Ky8aTvLgBF5totp5AuF8YN6vl",
    collectModule: {
      revertCollectModule: true
    },
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  }) {
    id
    expiresAt
    typedData {
      types {
        PostWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleInitData
        referenceModule
        referenceModuleInitData
      }
    }
  }
}`;
const dispatchPost = `
mutation CreatePostViaDispatcher {
  createPostViaDispatcher(
    request: {
      profileId: "0x856d"
      contentURI: $contentURI
      collectModule: { freeCollectModule: { followerOnly: true } }
      referenceModule: { followerOnlyReferenceModule: false }
    }
  ) {
    ... on RelayerResult {
      txHash
      txId
    }
    ... on RelayError {
      reason
    }
  }
}`;

//# sourceMappingURL=querys.js.map