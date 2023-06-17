import { useEffect, useState } from "react";
import { client, getDefaultProfile, getPublication, getSigner } from "../pages/api/api.js";
import { css } from "@emotion/css";
import { LensEnvironment, LensGatedSDK } from "@lens-protocol/sdk-gated";
import { Input } from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import { useAccount, useProvider } from "wagmi";

export default function Feed() {
  const [post, setPost] = useState();
  const [loading, setLoading] = useState(false);
  const [publicationId, setPublicationId] = useState("");
  const [profileId, setProfileId] = useState("0x85d9");
  const [message, setMessage] = useState("");
  const [postText, setProfileName] = useState("");
  const [commentResponse, setResponse] = useState();
  const [error, setError] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);
  const accounts = useAccount();

  async function checkConnection() {
    if (accounts.length) {
      /* if the user's wallet is connected, call the API and get the user's profile information */
      try {
        const response = await client.query({
          query: getDefaultProfile,
          variables: {
            address: accounts.address,
            limit: 50,
          },
        });
        console.log({ accounts, response });
      } catch (err) {
        console.log("error fetching profile... ", err);
        setMessage("error: user does not have a Lens profile");
      }
    }
  }
  async function decryptPost() {
    setMessage("");
    setPost();
    setLoading(true);
    try {
      /* here we call the API using the signed in user's profile ID to get the individual post */
      const result = await client.query({
        query: getPublication,
        variables: {
          publicationId,
          profileId,
        },
      });
      let post = result.data.publication;
      console.log({ post });

      /* if the user is unable to decrypt, set the message in the local state and return from the function */
      if (!post.canDecrypt.result) {
        setMessage("You are unable to view this post.");
        setLoading(false);
        return;
      }

      try {
        /* next, we create an instance of the Lens SDK */
        const sdk = await LensGatedSDK.create({
          provider: ethers.getDefaultProvider(),
          signer: getSigner(),
          env: LensEnvironment.Mumbai,
        });

        /* we then use the Lens SDK to decrypt the message */
        const decrypted = await sdk.gated.decryptMetadata(post.metadata);
        console.log({ decrypted });
        setPost(decrypted);
      } catch (err) {
        console.log("error decrypting post... ", err);
      }
      setLoading(false);
    } catch (err) {
      console.log("Error fetching posts...", err);
    }
  }

  return (
    <div className={contentContainerStyle}>
      <h1>Decrypt an individual publication</h1>
      <input
        onChange={e => setProfileId(e.target.value)}
        placeholder="ProfileId"
        value={profileId}
        className={inputStyle}
      />
      <input
        onChange={e => setPublicationId(e.target.value)}
        placeholder="ID of post"
        value={publicationId}
        className={inputStyle}
      />
      <button className={submitButtonStyle} onClick={decryptPost}>
        Decrypt Post
      </button>
      <Input
        value={postText}
        onChange={e => setProfileName(e.target.value)}
        onSubmit={e => e.preventDefault()}
        style={{ color: "black", width: "80%", marginLeft: "15%" }}
      />
      {post && (
        <div>
          <h3>Decrypted post</h3>
          <p>{post.content}</p>
        </div>
      )}
      {message && <p>{message}</p>}
      {loading && <p>Loading and decrypting post ...</p>}
      {error && <p>Error {error.message}</p>}
    </div>
  );
}

const contentContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const inputStyle = css`
  outline: none;
  border: 1px solid rgba(0, 0, 0, 0.25);
  padding: 9px 15px;
  border-radius: 25px;
  width: 320px;
  margin-bottom: 5px;
  margin-left: 4px;
`;

const submitButtonStyle = css`
  border: none;
  outline: none;
  padding: 13px 35px;
  border-radius: 35px;
  margin-right: 6px;
  cursor: pointer;
  font-weight: 800;
  color: white;
  background-color: #1976d2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  margin-top: 15px;
`;
