import { useCollectWithSelfFundedFallback } from "../hooks/useCollectWithSelfFundedFallback";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ErrorMessage } from "./lens-components//error/ErrorMessage";
import { Loading } from "./lens-components//loading/Loading";
import { CollectablePublicationCard } from "./lens-components/PublicationCard";
import { UnauthenticatedFallback } from "./lens-components/UnauthenticatedFallback";
import { WhenLoggedInWithProfile } from "./lens-components/auth";
import { CollectState, Comment, Post, ProfileOwnedByMe, isPostPublication, useFeed } from "@lens-protocol/react-web";

type CollectButtonProps = {
  collector: ProfileOwnedByMe;
  publication: Post | Comment;
};

function CollectButton({ collector, publication }: CollectButtonProps) {
  const { execute: collect, error, isPending } = useCollectWithSelfFundedFallback({ collector, publication });
  const isCollected = publication.hasCollectedByMe;

  switch (publication.collectPolicy.state) {
    case CollectState.COLLECT_TIME_EXPIRED:
      return <button disabled={true}>Collecting ended</button>;
    case CollectState.COLLECT_LIMIT_REACHED:
      return <button disabled={true}>Collect limit reached</button>;
    case CollectState.NOT_A_FOLLOWER:
      return <button disabled={true}>Only followers can collect</button>;
    case CollectState.CANNOT_BE_COLLECTED:
      return <button disabled={true}>Cannot be collected</button>;
    case CollectState.CAN_BE_COLLECTED:
      return (
        <>
          <button onClick={collect} disabled={isCollected || isPending} className={"btn"}>
            {error ? "Error" : isPending ? "Collecting..." : isCollected ? `You've already collected` : "Collect"}
          </button>
          {error && <ErrorMessage error={error} />}
        </>
      );
  }
}

type FeedProps = {
  activeProfile: ProfileOwnedByMe;
};

function Feed({ activeProfile }: FeedProps) {
  const {
    data: publications,
    error,
    loading,
    hasMore,
    observeRef,
  } = useInfiniteScroll(useFeed({ profileId: activeProfile.id }));

  if (loading) return <Loading />;

  if (error) return <ErrorMessage error={error} />;

  if (publications.length === 0) return <p>No items</p>;

  return (
    <>
      {publications
        .filter(i => isPostPublication(i.root))
        .map((item, i) => (
          <CollectablePublicationCard
            key={`${item.root.id}-${i}`}
            publication={item.comments ? [0] && item.comments[0] : item.root}
            collectButton={<CollectButton collector={activeProfile} publication={item.root} />}
          />
        ))}

      {hasMore && <p ref={observeRef}>Loading more...</p>}
    </>
  );
}

export default function UseCollect() {
  return (
    <div>
      <h1>
        <code>useCollect</code>
      </h1>
      <WhenLoggedInWithProfile>{({ profile }) => <Feed activeProfile={profile} />}</WhenLoggedInWithProfile>
      <UnauthenticatedFallback message="You must be logged in to collect a publication." />
    </div>
  );
}
