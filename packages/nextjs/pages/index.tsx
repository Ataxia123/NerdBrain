import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MetaHeader } from "../components/MetaHeader";
import Feed from "../components/decryptPublication.js";
import LensComponent from "../components/lensComponent.js";
import { Card } from "@mui/material";
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
      <div className="ps2-memory-card" style={{ marginTop: "10%", marginLeft: "53%" }}>
        <Card
          variant="outlined"
          style={{ display: "flexbox", paddingRight: "10%", backgroundColor: "gray", color: "cyan" }}
        >
          Chat GPT Share Link{" "}
          <a
            style={{ color: "blue" }}
            href="https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq"
            target="_blank"
            rel="noreferrer"
          >
            ?
          </a>{" "}
          <br />{" "}
          <textarea
            value={url}
            onChange={handleChange}
            style={{ color: "black", width: "80%", marginLeft: "15%", justifyContent: "center" }}
          />
          <br />
          Payout Wallet Address: <br />{" "}
          <textarea
            value={walletAddress}
            onChange={e => setAddress(e.target.value)}
            style={{ color: "black", width: "80%", marginLeft: "15%" }}
          />
          <br />
          PostValue [Matic]: <br />{" "}
          <input
            value={postValue}
            onChange={e => setPostValue(Number(e.target.value))}
            style={{ color: "black", width: "80%", marginLeft: "15%" }}
          />
          <br />
          Describe SavePoint: <br />{" "}
          <textarea
            value={postText}
            onChange={e => setProfileName(e.target.value)}
            style={{ color: "black", width: "80%", marginLeft: "15%" }}
          />
          <br />
          <button onClick={handleCreatePost} style={{ border: "1px solid black", marginLeft: "25%" }}>
            Create Post
          </button>
        </Card>
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

      <div className="flex items-center flex-col flex-grow pt-10 relative">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">SavePointGPT</span>
          </h1>
        </div>

        <br />
        <span>DECODE POSTS</span>

        <div
          className="flex-grow bg-base-300 w-full mt-16 px-8 py-12"
          style={{
            paddingRight: "20%",
          }}
        >
          <PostCreator />
          <Feed />
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row"></div>

          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl"></div>
        </div>
      </div>
    </>
  );
};

export default Home;
