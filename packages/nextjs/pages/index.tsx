import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MetaHeader } from "../components/MetaHeader";
import Feed from "../components/decryptPublication.js";
import LensComponent from "../components/lensComponent.js";
import axios from "axios";
import { create } from "domain";
import { config } from "dotenv";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  // Assuming createPost is in the same file, otherwise import it
  const [postText, setProfileName] = useState("");
  const [url, setUrl] = useState("");
  const [postValue, setPostValue] = useState(1);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [walletAddress, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [commentResponse, setResponse] = useState<any>();

  useEffect(() => {
    if (isConnecting && address) setAddress(address);
  }, [isConnecting]);

  const handleChange = (event: any) => {
    const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;
    if (!urlRegex.test(event.target.value)) {
      alert("Invalid URL format.");
    } else {
      setUrl(event.target.value);
    }
  };

  config();
  const PostCreator = () => {
    const handleCreatePost = async () => {
      try {
        const response = await createPost({
          text: url,
          msgSender: walletAddress,
          value: postValue,
        });
        console.log(response), "Postresponse";
        setResponse(response);
        setTimeout(async () => {
          const profileResponse = await createProfile({
            postId: response,
            description: postText,
          });
          console.log(profileResponse, "after 10 seconds");
        }, 10000);
        console.log("after 10 seconds");
      } catch (error: any) {
        setError(error);
      }
      console.log("response hook triggered!");
    };

    return (
      <div>
        Chat Yipity Link <br /> <textarea value={url} onChange={handleChange} style={{ color: "black" }} />
        <br />
        Payout Address: <br />{" "}
        <textarea value={walletAddress} onChange={e => setAddress(e.target.value)} style={{ color: "black" }} />
        <br />
        PostValue: <br />{" "}
        <textarea value={postValue} onChange={e => setPostValue(Number(e.target.value))} style={{ color: "black" }} />
        <br />
        Describe SavePoint: <br />{" "}
        <textarea value={postText} onChange={e => setProfileName(e.target.value)} style={{ color: "black" }} />
        <br />
        <button onClick={handleCreatePost}>Create Post</button>
        <div></div>
      </div>
    );
  };

  const createPost = async (postData: any) => {
    try {
      const post = await axios.post("/api/callLens", postData);
      console.log(post.data.data);
      return post.data.data;
      // setTimeout(async () => {

      // }, 10);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const createProfile = async (postData: any) => {
    console.log("posting comment to encrypted post", postData);
    try {
      console.log("posting comment to encrypted post");
      const response = await axios.post("/api/comment", postData);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">SavePointGPT</span>
          </h1>
        </div>
        <PostCreator />
        <br />
        <span>DECODE POSTS</span>
        <Feed />

        <div
          className="flex-grow bg-base-300 w-full mt-16 px-8 py-12"
          style={{
            marginLeft: "20%",
            paddingRight: "20%",
          }}
        >
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row"></div>
          <LensComponent />

          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl"></div>
        </div>
      </div>
    </>
  );
};

export default Home;
