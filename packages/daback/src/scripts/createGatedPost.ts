import { getAuthenticatedClient } from './shared/getAuthenticatedClient';
import { setupWallet } from './shared/setupWallet';
import { uploadWithBundlr } from './shared/uploadWithBundlr';
import { buildPublicationMetadata } from './shared/buildPublicationMetadata';
import { CollectModuleParams, CreateDataAvailabilityPostRequest, SimpleCollectModuleParams, isRelayerResult } from '@lens-protocol/client';
import { ContractType, LensGatedSDK, LensEnvironment, ScalarOperator, PublicationMainFocus, CollectCondition } from '@lens-protocol/sdk-gated';
import { CreatePublicPostRequest, isCreateDataAvailabilityPublicationResult } from '@lens-protocol/client';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { request } from 'http';

const wallet = setupWallet();
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
const profileId = '0x8585';
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

export async function createPost(text: string) {
  const address = await wallet.getAddress();
  const lensClient = await getAuthenticatedClient(wallet);

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
    collectModule,
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

  // broadcastResult is a Result object
  const broadcastValue = broadcastResult.unwrap();

  if (!isRelayerResult(broadcastValue)) {
    console.log(`Something went wrong`, broadcastValue);
    return;
  }

  console.log(`DA post was created: `, broadcastValue);
}
