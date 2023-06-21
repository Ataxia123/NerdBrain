import React, { useEffect, useState } from "react";
import Link from "next/link";
import CollectSavePoint from "../components/CollectSavePoint";
import { MetaHeader } from "../components/MetaHeader";
import { PostCard } from "../components/PostCard";
import Publication from "../components/Publication";
import UseCollect from "../components/UseCollect";
import { UseCollectedPublications } from "../components/UseCollectedPublications";
import UseProfileByHandle from "../components/UseProfileByHandle";
import UseSearchPublication from "../components/UseSearchPublications";
import { ProfileId } from "@lens-protocol/react-web";
import axios from "axios";
import { create } from "domain";
import { config } from "dotenv";
import { add, debounce } from "lodash";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const [url, setUrl] = useState("");
  const [postValue, setPostValue] = useState(0.1);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [walletAddress, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [commentResponse, setResponse] = useState<any>();
  const [debouncedValue, setDebouncedValue] = useState("");
  const [postId, setPostId] = useState("");
  const [postText, setPostText] = useState("");
  const [loading, setLoading] = useState(false);

  // Update debounced value after user stops typing for 500ms

  useEffect(() => {
    if (isConnecting && address) setAddress(address);
  }, [isConnecting, address, setAddress]);

  const handleChange = (event: any) => {
    const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;
    if (!urlRegex.test(event.target.value)) {
      alert("Invalid URL format.");
    } else {
      setUrl(event.target.value);
    }
  };

  // Move postComment and createProfile functions to a new or existing custom Hook

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow pt-10">
        <UseProfileByHandle />
        <div className="flex items-center flex-col flex-grow pt-10 relative">
          <br />
          <span>DECODE POSTS</span>
          {loading && <span>LOADING</span>}

          <PostCard
            walletAddress={walletAddress}
            setWalletAddress={setAddress}
            postText={postText}
            setPostText={setPostText}
            postValue={postValue}
            setPostValue={setPostValue}
            setResponse={setResponse}
            setError={setError}
            setLoading={setLoading}
            loading={loading}
          />

          <UseSearchPublication />
        </div>

        <div className="flex justify-center items-top gap-12 flex-col sm:flex-row">
          {/* this is the css that affects collect savepoint feed div */}
          <CollectSavePoint />

          {/* this is the spot that affects the "restrict event types" div or whatever its called */}
          <Publication />
        </div>
      </div>
    </>
  );
};

export default Home;
