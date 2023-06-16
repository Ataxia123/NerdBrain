import { useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { PublicationCard } from "./lens-components/PublicationCard";
import { LoginButton, WhenLoggedInWithProfile, WhenLoggedOut } from "./lens-components/auth";
import { ErrorMessage } from "./lens-components/error/ErrorMessage";
import { Loading } from "./lens-components/loading/Loading";
import { profileId, usePublications } from "@lens-protocol/react-web";

export default function useFeed() {
  const {
    data: publications,
    error,
    loading,
    hasMore,
    observeRef,
  } = useInfiniteScroll(usePublications({ profileId: profileId("0x85d9"), observerId: profileId("0x7136") }));

  if (loading) return <Loading />;

  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>
        <code>usePublications</code>
      </h1>
      <div>
        {publications.map(publication => (
          <PublicationCard key={publication.id} publication={publication} />
        ))}
        {hasMore && <p ref={observeRef}>Loading more...</p>}
      </div>
    </div>
  );
}
