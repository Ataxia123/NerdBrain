import { buildPublicationMetadata } from "./shared/buildPublicationMetadata";
import { getActiveProfile } from "./shared/getActiveProfile";
import { getAuthenticatedClient } from "./shared/getAuthenticatedClient";
import { setupWallet } from "./shared/setupWallet";
import { uploadWithBundlr } from "./shared/uploadWithBundlr";
import { isCreateDataAvailabilityPublicationResult } from "@lens-protocol/client";
import { ContractType, LensEnvironment, LensGatedSDK, ScalarOperator } from "@lens-protocol/sdk-gated";

export async function postThingy(text: string) {
  const wallet = setupWallet();
  const address = await wallet.getAddress();
  const lensClient = await getAuthenticatedClient(wallet);
  const profile = await getActiveProfile(lensClient, address);
  const profileId = "0x8585";

  // prepare metadata
  const metadata = buildPublicationMetadata({
    content: text,
    name: "Data Availability Post created with LensClient SDK",
  });
  const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;

  if (!urlRegex.test(text)) {
    console.log(`Invalid URL format.`);
    return new Error(`Invalid URL format.`);
  }
  // validate metadata
  const validateResult = await lensClient.publication.validateMetadata(metadata);

  if (!validateResult.valid) {
    return new Error(`Metadata is not valid.`);
  }

  // upload metadata to
  const contentURI = await uploadWithBundlr(metadata);

  console.log(`Post metadata was uploaded to ${contentURI}`);

  // fetch a create DA post typed data
  const createPostTypedDataResult = await lensClient.publication.createDataAvailabilityPostTypedData({
    from: profileId,
    contentURI,
  });

  const createPostTypedDataValue = createPostTypedDataResult.unwrap();

  console.log(`createDataAvailabilityPostTypedData result: `, createPostTypedDataValue);

  // sign with the wallet
  const signedTypedData = await wallet._signTypedData(
    createPostTypedDataValue.typedData.domain,
    createPostTypedDataValue.typedData.types,
    createPostTypedDataValue.typedData.value,
  );

  console.log(`Broadcasting signed createDataAvailabilityPostTypedData...`);

  const broadcastResult = await lensClient.transaction.broadcastDataAvailability({
    id: createPostTypedDataValue.id,
    signature: signedTypedData,
  });

  // broadcastResult is a Result object
  const broadcastValue = broadcastResult.unwrap();

  if (!isCreateDataAvailabilityPublicationResult(broadcastValue)) {
    console.log(`Something went wrong`, broadcastValue);
    return;
  }

  console.log(`DA post was created: `, broadcastValue);
}
