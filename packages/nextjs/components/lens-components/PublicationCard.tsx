import { ReactNode, useEffect, useRef, useState } from "react";
import { formatAmount } from "../../utils/utils";
import { ProfilePicture } from "./ProfilePicture";
import {
  AnyCriterion,
  CollectState,
  Comment,
  ContentPublication,
  DecryptionCriteriaType,
  Mirror,
  PendingPost,
  Post,
  isMirrorPublication,
  useEncryptedPublication,
} from "@lens-protocol/react-web";
import { useInView } from "react-cool-inview";

function formatDecryptionCriterion(criterion: AnyCriterion): string {
  switch (criterion.type) {
    case DecryptionCriteriaType.NFT_OWNERSHIP:
      return `own NFT ${criterion.contractAddress}`;

    case DecryptionCriteriaType.ERC20_OWNERSHIP:
      return `have ERC20 ${formatAmount(criterion.amount)}`;

    case DecryptionCriteriaType.ADDRESS_OWNERSHIP:
      return `own address ${criterion.address}`;

    case DecryptionCriteriaType.PROFILE_OWNERSHIP:
      return `own profile: ${criterion.profileId}`;

    case DecryptionCriteriaType.FOLLOW_PROFILE:
      return `follow profile ${criterion.profileId}`;

    case DecryptionCriteriaType.COLLECT_PUBLICATION:
      return `have collected ${criterion.publicationId}`;

    case DecryptionCriteriaType.COLLECT_THIS_PUBLICATION:
      return `have collected this publication`;

    case DecryptionCriteriaType.OR:
      return criterion.or.map(formatDecryptionCriterion).join(", ");

    case DecryptionCriteriaType.AND:
      return criterion.and.map(formatDecryptionCriterion).join(", ");
  }
}

type ContentProps = {
  publication: ContentPublication;
  isViewing: boolean;
  onScratchOff: () => void;
};
export function Content({ publication, isViewing, onScratchOff }: ContentProps) {
  const { decrypt, data, error, isPending } = useEncryptedPublication({
    publication,
  });

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  // Use useRef to store the unobserve function
  const unobserveRef = useRef<(() => void) | null>(null);

  const { observe } = useInView({
    threshold: 1,
    onEnter: async ({ unobserve }) => {
      // Store the unobserve function in the ref
      unobserve();
      console.log("unobserverded", unobserve);
      if (!isViewing) {
        return "Not viewing this post"; // If the card is not being viewed, don't decrypt yet
      }
      // If the card is being viewed, stop observing and start decrypting

      void decrypt();
      console.log("decrypting");
    },
  });

  // if (isPending) {
  //   return <p>WAAAA...</p>;
  // }
  if (isPending && error) {
    return <p>WAAAA...</p>;
  }

  if (error && isPending) {
    console.log(error, isPending);
    return <p>{error?.message}</p>;
  }

  if (data.hidden) {
    return <p>This publication has been hidden</p>;
  }

  return (
    <article>
      {/* "Scratch off" overlay */}
      {!isViewing && (
        <div
          style={{
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "300%",
            opacity: !isOverlayVisible ? 1 : 1,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={onScratchOff}
        >
          <p>Click to reveal content</p>

          <p>{data.metadata.content}</p>
          {data.decryptionCriteria && (
            <small>
              <i>
                To decrypt this publication you need to:&nbsp;
                <b>{formatDecryptionCriterion(data.decryptionCriteria)}</b>
              </i>
            </small>
          )}
        </div>
      )}
      {isViewing && (
        <div ref={observe}>
          <p>Post Content</p>
          {isPending && !data.metadata.content && <p>Decrypting...</p>}
          <p>{data.metadata.content}</p>
          <p>{!data.canObserverDecrypt && "Cannot Decrypt"}</p>
          {data.decryptionCriteria && (
            <small>
              <i>
                To decrypt this publication you need to:&nbsp;
                <b>{formatDecryptionCriterion(data.decryptionCriteria)}</b>
              </i>
            </small>
          )}
        </div>
      )}
    </article>
  );
}

type PublicationCardProps = {
  publication: Post | Comment | Mirror | PendingPost;
};
export function PublicationCard({ publication }: PublicationCardProps) {
  const [currentlyViewing, setCurrentlyViewing] = useState<any>(null);
  if (publication.__typename === "PendingPost") {
    return (
      <article>
        <ProfilePicture picture={publication.profile.picture} />
        <p>{publication.profile.name ?? `@${publication.profile.handle}`}</p>
        <div>{publication.content}</div>
      </article>
    );
  }

  return (
    <article>
      <ProfilePicture picture={publication.profile.picture} />
      <p>{publication.profile.name ?? `@${publication.profile.handle}`}</p>
      <Content
        key={publication.id}
        publication={isMirrorPublication(publication) ? publication.mirrorOf : publication}
        isViewing={currentlyViewing === publication.id}
        onScratchOff={() => setCurrentlyViewing(publication.id)}
      />
    </article>
  );
}

type CollectablePublicationCardProps = {
  publication: Post | Comment;
  collectButton: ReactNode;
};

export function CollectablePublicationCard({ publication, collectButton }: CollectablePublicationCardProps) {
  return (
    <article className="ps2-memory-card">
      <p>SAVEPOINT:</p>
      <p>{publication.hidden ? "This publication has been hidden" : publication.metadata.content}</p>
      {collectButton}
      {publication.collectPolicy.state === CollectState.COLLECT_LIMIT_REACHED && (
        <p>
          {publication.stats.totalAmountOfCollects}/{publication.collectPolicy.collectLimit} collected
        </p>
      )}
      {publication.collectPolicy.state === CollectState.COLLECT_TIME_EXPIRED && (
        <p>Collectable until: {publication.collectPolicy.endTimestamp}</p>
      )}
    </article>
  );
}
