import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MetaHeader } from "../components/MetaHeader";
import Feed from "../components/decryptPublication.js";
import LensComponent from "../components/lensComponent.js";
import { Card, Input } from "@mui/material";
import axios from "axios";
import { create } from "domain";
import { config } from "dotenv";
import { debounce } from "lodash";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

// Assuming createPost is in the same file, otherwise import it

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
  }, [isConnecting]);

  const handleChange = (event: any) => {
    const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;
    if (!urlRegex.test(event.target.value)) {
      alert("Invalid URL format.");
    } else {
      setUrl(event.target.value);
    }
  };

  async function postComment() {
    const profileResponse = await createProfile({
      postId: commentResponse,
      description: postText,
    });
    console.log(profileResponse, "Comment Posted!");
  }

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

  useEffect(() => {
    if (postId !== "") {
      setTimeout(() => {
        postComment();
        console.log("comment posted");
        setLoading(false);
      }, 10000);
      console.log("Posting COmment");
    }
  }, [postId]);

  const handleCreatePost = async () => {
    try {
      const response = await createPost({
        text: url,
        msgSender: walletAddress,
        value: postValue,
      });
      console.log(response), "Postresponse";
      setResponse(response);

      console.log("after 10 seconds");
    } catch (error: any) {
      setError(error);
      setLoading(false);
    }
    console.log("response hook triggered!");
  };

  const createPost = async (postData: any) => {
    if (loading) return "Loading";
    setLoading(true);
    try {
      const post = await axios.post("/api/callLens", postData);
      console.log(post.data.data);
      setPostId(post.data.data);
      return post.data.data;
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
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
        {loading && <span>LOADING</span>}
        <div
          className="flex-grow bg-base-300 w-full mt-16 px-8 py-12"
          style={{
            paddingRight: "20%",
          }}
        >
          <div className="ps2-memory-card" style={{ marginTop: "10%", marginLeft: "53%" }}>
            <Card
              variant="outlined"
              style={{ display: "flexbox", paddingRight: "10%", color: "#949491", backgroundColor: "#0e0f0f" }}
            >
              <span style={{ color: "#176db8" }}> Chat GPT Share Link </span>
              <a
                style={{ color: "blue" }}
                href="https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq"
                target="_blank"
                rel="noreferrer"
              >
                ?
              </a>{" "}
              <br />{" "}
              <Input
                value={url}
                onChange={handleChange}
                style={{ color: "white", width: "80%", marginLeft: "15%", justifyContent: "center" }}
              />
              <br />
              Payout Wallet Address: <br />{" "}
              <Input
                value={walletAddress}
                onChange={e => setAddress(e.target.value)}
                style={{ color: "white", width: "80%", marginLeft: "15%" }}
              />
              <br />
              <br />
              PostDescription
              <Input
                value={postText}
                onChange={e => setPostText(e.target.value)}
                style={{ color: "white", width: "80%", marginLeft: "15%" }}
              />
              PostValue [Matic]: <br />{" "}
              <Input
                value={postValue}
                onChange={e => setPostValue(parseInt(e.target.value))}
                style={{ color: "white", width: "80%", marginLeft: "15%" }}
              />
              <br />
              <button onClick={handleCreatePost} style={{ border: "1px solid black", marginLeft: "25%" }}>
                Create Post
              </button>
              {commentResponse && commentResponse}
            </Card>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            Describe SavePoint: <br />
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              {" "}
              <Feed />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
