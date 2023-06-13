import { getAuthenticatedClient } from './shared/getAuthenticatedClient';
import { setupWallet } from './shared/setupWallet';
import { uploadWithBundlr } from './shared/uploadWithBundlr';
import { buildPublicationMetadata } from './shared/buildPublicationMetadata';
import {
  CollectModuleParams,
  CreateDataAvailabilityPostRequest,
  SimpleCollectModuleParams,
  isRelayerResult,
  MultirecipientFeeCollectModuleParams,
} from '@lens-protocol/client';
import { ContractType, LensGatedSDK, LensEnvironment, ScalarOperator, PublicationMainFocus, CollectCondition } from '@lens-protocol/sdk-gated';
import { CreatePublicPostRequest, isCreateDataAvailabilityPublicationResult } from '@lens-protocol/client';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { CollectModules, FollowModules, ReferenceModules } from '@lens-protocol/client';
import { commentThingy } from './createComment';

const wallet = setupWallet();
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
const profileId = '0x85d9';

const accessCondition = {
  contractAddress: '0xd74c4701cc887ab8b6b5302ce4868c4fbc23de75',
  chainID: 80001,
  contractType: ContractType.Erc721,
};

const collectModule = {
  simpleCollectModule: {
    followerOnly: false,
  } as SimpleCollectModuleParams,
};

const collectAccessCondition: CollectCondition = {
  thisPublication: true,
};

export async function createPost(text: string, msgSender: string, value: number, description: string) {
  console.log(`Creating post...`);
  console.log(`msgSender: ${msgSender}`, `value: ${value}`, `text: ${text}`);
  const address = await wallet.getAddress();
  console.log(`address: ${address}`);
  const multiCollectModule = {
    multirecipientFeeCollectModule: {
      amount: {
        currency: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        value: '1',
      },
      recipients: [
        {
          recipient: `${msgSender}`,
          split: 99,
        },
        {
          recipient: address,
          split: 1,
        },
      ],
      referralFee: 10,
      followerOnly: false,
      // "collectLimit": 5 -- if set, will end up in a limited collect
      // "endTimestamp": "2024-01-01T00:00:00" -- if set will set a timestamp after which, attempted collects will revert
    } as MultirecipientFeeCollectModuleParams,
  };

  const lensClient = await getAuthenticatedClient(wallet);

  const result = await lensClient.modules.approvedAllowanceAmount({
    currencies: ['0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'],
    collectModules: [CollectModules.MultirecipientFeeCollectModule],
    followModules: [FollowModules.FeeFollowModule],
    referenceModules: [ReferenceModules.FollowerOnlyReferenceModule],
  });

  console.log(`approvedAllowanceAmount result: `, result);

  // prepare metadata
  const metadata = {
    version: '2.0.0',
    content: text,
    description: 'This is a gated post!',
    name: `Post by @${profileId}`,
    external_url: `https://lenster.xyz/u/savepointgpt`,
    metadata_id: uuid(),
    mainContentFocus: 'TEXT_ONLY' as PublicationMainFocus,
    attributes: [],
    locale: 'en-US',
  };

  // Initialize the Lens SDK
  const sdk = await LensGatedSDK.create({
    provider: provider,
    signer: wallet, // Assuming wallet is the signer here
    env: LensEnvironment.Mumbai,
  });

  // Define the access condition
  const condition = {
    collect: collectAccessCondition,
  };

  // Encrypt the metadata and upload it to IPFS
  const { contentURI, encryptedMetadata } = await sdk.gated.encryptMetadata(
    metadata,
    profileId,

    {
      ...condition,
    },
    async function (EncryptedMetadata) {
      const added = await uploadWithBundlr(EncryptedMetadata);
      return added;
    },
  );

  const gated = {
    encryptedSymmetricKey: encryptedMetadata.encryptionParams.providerSpecificParams.encryptionKey,
    collect: collectAccessCondition,
  };

  console.log(`Post metadata was uploaded to ${contentURI}`);

  // fetch a create DA post typed data
  const createPostTypedDataResult = await lensClient.publication.createPostTypedData({
    profileId,
    contentURI,
    collectModule: multiCollectModule,
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
    gated,
  } as CreatePublicPostRequest);

  const createPostTypedDataValue = createPostTypedDataResult.unwrap();

  console.log(`createDataAvailabilityPostTypedData result: `, createPostTypedDataValue);

  // sign with the wallet
  const signedTypedData = await wallet._signTypedData(
    createPostTypedDataValue.typedData.domain,
    createPostTypedDataValue.typedData.types,
    createPostTypedDataValue.typedData.value,
  );

  console.log(`Broadcasting signed createDataAvailabilityPostTypedData...`);

  const broadcastResult = await lensClient.transaction.broadcast({
    id: createPostTypedDataValue.id,
    signature: signedTypedData,
  });

  const nonce = createPostTypedDataValue.typedData.value.nonce + 1;

  // broadcastResult is a Result object
  const broadcastValue = broadcastResult.unwrap();

  if (!isRelayerResult(broadcastValue)) {
    console.log(`Something went wrong`, broadcastValue);
    return;
  }

  console.log(`DA post was created: `, broadcastValue);

  function makePostId(nonce: number) {
    const hexNumber = '0x' + Number(nonce).toString(16);

    const postId = `${profileId}-${hexNumber}`;
    return postId;
  }

  const postId = makePostId(nonce);
  console.log(`postId: ${postId}`);
  setTimeout(() => {
    commentThingy(postId, description);
    console.log('done');
  }, 25000);
  console.log('awaiting for Indexing');
}
