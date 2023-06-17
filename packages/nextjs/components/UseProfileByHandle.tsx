import { useState } from "react";
import { useFollowWithSelfFundedFallback } from "../hooks/useFollowWithSelfFundedFallback";
import { ProfileCard } from "./lens-components/ProfileCard";
import { ProfileSelector } from "./lens-components/ProfileSelector";
import { UnauthenticatedFallback } from "./lens-components/UnauthenticatedFallback";
import { WhenLoggedInWithProfile } from "./lens-components/auth";
import { ErrorMessage } from "./lens-components/error/ErrorMessage";
import { Loading } from "./lens-components/loading/Loading";
import { Profile, ProfileOwnedByMe, useExploreProfiles, useProfile, useUnfollow } from "@lens-protocol/react-web";

type FollowButtonProps = {
  follower: ProfileOwnedByMe;
  followee: Profile;
};

function FollowButton({ followee, follower }: FollowButtonProps) {
  const {
    execute: follow,
    error: followError,
    isPending: isFollowPending,
  } = useFollowWithSelfFundedFallback({
    followee,
    follower,
  });

  const { execute: unfollow, error: unfollowError, isPending: isUnfollowPending } = useUnfollow({ follower, followee });

  if (followee.followStatus === null) {
    return null;
  }

  if (followee.followStatus.isFollowedByMe) {
    return (
      <>
        <button onClick={unfollow} disabled={isUnfollowPending}>
          Unfollow
        </button>
        {unfollowError && <p>{unfollowError.message}</p>}
      </>
    );
  }

  return (
    <>
      <button onClick={follow} disabled={isFollowPending}>
        Follow
      </button>
      {followError && <p>{followError.message}</p>}
    </>
  );
}

type ProfileByHandleLayoutProps = {
  handle: string;
};

export function ProfileByHandleLayout({ handle }: ProfileByHandleLayoutProps) {
  const { data: gptProfile, error, loading } = useProfile({ handle });

  if (loading) return <Loading />;

  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>Profile by Handle</h2>
      <WhenLoggedInWithProfile>
        {({ profile }) => (
          <>
            <FollowButton followee={gptProfile} follower={profile} /> <ProfileCard profile={gptProfile} />
          </>
        )}
      </WhenLoggedInWithProfile>
      <UnauthenticatedFallback message="Log in to follow or unfollow profiles" />
    </div>
  );
}

export default function ProfileByHandle() {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <>
      <ProfileByHandleLayout handle={"save-point-gpt.test"} />
    </>
  );
}
