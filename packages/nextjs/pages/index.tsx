import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MetaHeader } from "../components/MetaHeader";
import UseCollect from "../components/UseCollect";
import { UseCollectedPublications } from "../components/UseCollectedPublications";
import UseProfileByHandle from "../components/UseProfileByHandle";
import UseSearchPublication from "../components/UseSearchPublications";
import { ProfileId } from "@lens-protocol/react-web";
import { Card, Input } from "@mui/material";
import axios from "axios";
import { create } from "domain";
import { config } from "dotenv";
import { add, debounce } from "lodash";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";

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
  }, [isConnecting, address, setAddress]);

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

      <div className="flex items-center flex-col flex-grow pt-10">
        <UseProfileByHandle />
        <div className="flex items-center flex-col flex-grow pt-10 relative">
          <br />
          <span>DECODE POSTS</span>
          {loading && <span>LOADING</span>}
          <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-8">
            <BugAntIcon className="h-8 w-8 fill-secondary flex" />
            <div className="ps2-memory-card" style={{ marginTop: "-20%", overflow: "visible" }}>
              <Card
                variant="outlined"
                style={{
                  display: "flexbox",
                  paddingRight: "10%",
                  color: "#949491",
                  backgroundColor: "#0e0f0f",
                  borderRadius: "15px",
                }}
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
                  style={{
                    color: "white",
                    width: "80%",
                    marginLeft: "15%",
                    justifyContent: "center",
                    border: "white 2px solid",
                    borderRadius: "5px",
                  }}
                />
                <br />
                Payout Wallet Address: <br />{" "}
                <Input
                  value={walletAddress}
                  onChange={e => setAddress(e.target.value)}
                  style={{
                    color: "white",
                    width: "80%",
                    marginLeft: "15%",
                    border: "white 2px solid",
                    borderRadius: "5px",
                  }}
                />
                <br />
                <br />
                PostDescription
                <Input
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  style={{
                    color: "white",
                    width: "80%",
                    marginLeft: "15%",
                    border: "white 2px solid",
                    borderRadius: "5px",
                  }}
                />
                PostValue [Matic]: <br />{" "}
                <Input
                  value={postValue}
                  onChange={e => setPostValue(parseInt(e.target.value))}
                  style={{
                    color: "white",
                    width: "80%",
                    marginLeft: "15%",
                    border: "white 2px solid",
                    borderRadius: "5px",
                  }}
                />
                <br />
                <button
                  onClick={handleCreatePost}
                  className={"btn"}
                  style={{ border: "1px solid black", marginLeft: "10%" }}
                >
                  Create Post
                </button>
                {commentResponse && commentResponse}
              </Card>
            </div>
          </div>
          <UseSearchPublication />
        </div>

        <div className="flex justify-center items-top gap-12 flex-col sm:flex-row">
          {/* this is the css that affects collect savepoint feed div */}
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center max-w-xs mt-6 items-center rounded-3xl">
            <SparklesIcon className="h-8 w-8 fill-secondary" />
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              Collect SavePoint: <br />
              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                {" "}
                <UseCollect />
              </div>
            </div>
          </div>
          {/* this is the spot that affects the "restrict event types" div or whatever its called */}
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center mt-6 max-w-xs overflow-auto rounded-3xl">
            <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
            <UseCollectedPublications />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
