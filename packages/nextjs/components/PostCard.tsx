import React, { FC, useState } from "react";
import { Card, Input } from "@mui/material";
import axios from "axios";
import { BugAntIcon } from "@heroicons/react/24/outline";

interface PostCardProps {
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  postText: string;
  setPostText: React.Dispatch<React.SetStateAction<string>>;
  postValue: number;
  setPostValue: React.Dispatch<React.SetStateAction<number>>;
  setResponse: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

export const PostCard: FC<PostCardProps> = ({
  walletAddress,
  setWalletAddress,
  postText,
  setPostText,
  postValue,
  setPostValue,
  setResponse,
  setError,
  setLoading,
  loading,
}) => {
  const [url, setUrl] = useState("");
  const [postId, setPostId] = useState("");
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
          <br />
          <Input
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
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
            onChange={e => setWalletAddress(e.target.value)}
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
          Post Description
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
          Post Value [Matic]: <br />{" "}
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
          <button onClick={handleCreatePost} className={"btn"} style={{ border: "1px solid black", marginLeft: "10%" }}>
            Create Post
          </button>
        </Card>
      </div>
    </div>
  );
};
