import { useState } from "react";
import { Content, PublicationCard } from "../components/lens-components/PublicationCard";
import { LoginButton, WhenLoggedInWithProfile, WhenLoggedOut } from "../components/lens-components/auth";
import { ErrorMessage } from "../components/lens-components/error/ErrorMessage";
import { Loading } from "../components/lens-components/loading/Loading";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useActiveProfile } from "@lens-protocol/react-web";
import { FeedEventItemType, ProfileOwnedByMe, useFeed } from "@lens-protocol/react-web";
import type { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { UseCollectedPublications } from "~~/components/UseCollectedPublications";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

const Debug: NextPage = () => {
  const contractNames = getContractNames();
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
  );
  const allFeedEventTypes = [
    FeedEventItemType.Comment,
    FeedEventItemType.Post,
    FeedEventItemType.Mirror,
    FeedEventItemType.CollectComment,
    FeedEventItemType.CollectPost,
  ];

  type UseFeedInnerProps = {
    profile: ProfileOwnedByMe;
  };

  function UseFeedInner({ profile }: UseFeedInnerProps) {
    const [restrictEventTypesTo, setRestrictEventTypesTo] = useState<FeedEventItemType[]>([FeedEventItemType.Comment]);
    const { data, error, loading, hasMore, observeRef, prev } = useInfiniteScroll(
      useFeed({
        profileId: profile.id,
        ...(restrictEventTypesTo.length > 0 && { restrictEventTypesTo }),
        observerId: profile.id,
      }),
    );
    return (
      <div>
        <fieldset>
          <legend>Restrict event types to</legend>
          {allFeedEventTypes.map(value => (
            <label key={value}>
              <input
                type="checkbox"
                checked={restrictEventTypesTo.includes(value)}
                name="restrictEventTypesTo"
                value={value}
                onChange={e => {
                  if (e.target.checked) {
                    setRestrictEventTypesTo([...restrictEventTypesTo, value]);
                  } else {
                    setRestrictEventTypesTo(restrictEventTypesTo.filter(i => i !== value));
                  }
                }}
              />
              &nbsp;{value}
            </label>
          ))}
        </fieldset>

        {data?.length === 0 && <p>No items</p>}

        {loading && <Loading />}

        {error && <ErrorMessage error={error} />}

        <button disabled={loading} onClick={prev}>
          Fetch newer
        </button>

        {data?.map((item, i) => (
          <>
            <PublicationCard key={`${item.root.id}-${i}`} publication={item.root} />
            {item.comments?.map((comment, j) => (
              <Content
                key={`${comment.id}-${i}`}
                publication={comment}
                isViewing={false}
                onScratchOff={() => {
                  console.log("scratch off");
                }}
              />
            ))}
          </>
        ))}

        {hasMore && <p ref={observeRef}>Loading more...</p>}
      </div>
    );
  }
  return (
    <>
      <MetaHeader
        title="Debug Contracts | Scaffold-ETH 2"
        description="Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way"
      />

      <div className="container max-w-3xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {" "}
        <div>
          <h1>
            <WhenLoggedInWithProfile>{({ profile }) => <UseFeedInner profile={profile} />}</WhenLoggedInWithProfile>
            <WhenLoggedOut>
              <div>
                <p>You must be logged in to use this example.</p>
              </div>
            </WhenLoggedOut>
            <code>useCollectedPublications</code>
            <LoginButton />
          </h1>
        </div>
      </div>
    </>
  );
};

export default Debug;
