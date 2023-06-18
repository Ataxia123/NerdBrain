import { useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { Content, PublicationCard } from "./lens-components/PublicationCard";
import { LoginButton, WhenLoggedInWithProfile, WhenLoggedOut } from "./lens-components/auth";
import { ErrorMessage } from "./lens-components/error/ErrorMessage";
import { Loading } from "./lens-components/loading/Loading";
import { useCollectedPublications } from "@lens-protocol/react-web";
import { useActiveProfile } from "@lens-protocol/react-web";
import { FeedEventItemType, ProfileOwnedByMe, useFeed } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";

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
  console.log(data);
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

export default function UseCollectedPublications() {
  return (
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
  );
}
