import { getActiveProfile } from "./shared/getActiveProfile";
import { getAuthenticatedClient } from "./shared/getAuthenticatedClient";
import { setupWallet } from "./shared/setupWallet";
import { isRelayerResult } from "@lens-protocol/client";

async function main() {
  const wallet = setupWallet();
  const address = await wallet.getAddress();
  const lensClient = await getAuthenticatedClient(wallet);
  const activeProfile = await getActiveProfile(lensClient, address);

  // we need some typedData to sign and broadcast so let's set the dispatcher as an example
  const setDispatcherResult = await lensClient.profile.createSetDispatcherTypedData({
    profileId: activeProfile.id,
  });

  const setDispatcherResult2 = await lensClient.publication.createPostTypedData({
    profileId: activeProfile.id,
    contentURI: "https://example.com",
    collectModule: {
      revertCollectModule: true, // collect disabled
    },
    referenceModule: {
      followerOnlyReferenceModule: false, // anybody can comment or mirror
    },
  });

  // setDispatcherResult is a Result object
  const data = setDispatcherResult2.unwrap();

  // sign with the wallet
  const signedTypedData = await wallet._signTypedData(
    data.typedData.domain,
    data.typedData.types,
    data.typedData.value,
  );

  // broadcast
  const broadcastResult = await lensClient.transaction.broadcast({
    id: data.id,
    signature: signedTypedData,
  });

  // broadcastResult is a Result object
  const broadcastResultValue = broadcastResult.unwrap();

  if (!isRelayerResult(broadcastResultValue)) {
    console.log(`Something went wrong`, broadcastResultValue);
    return;
  }

  console.log(
    `Transaction to set dispatcher for profile ${activeProfile.id} was successfuly broadcasted with txId ${broadcastResultValue.txId}`,
  );

  // single check
  const wasIndexedFirstCheck = await lensClient.transaction.wasIndexed(broadcastResultValue.txId);
  console.log(`Transaction status: `, wasIndexedFirstCheck.unwrap());

  // wait in a loop
  console.log(`Waiting for the transaction to be indexed...`);
  await lensClient.transaction.waitForIsIndexed(broadcastResultValue.txId);

  // now the transaction is indexed
  const wasIndexedFinalCheck = await lensClient.transaction.wasIndexed(broadcastResultValue.txId);
  console.log(`Transaction status: `, wasIndexedFinalCheck.unwrap());
}

main();
