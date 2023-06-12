import React, { useState } from "react";
import Link from "next/link";
import { MetaHeader } from "../components/MetaHeader";
import Feed from "../components/decryptPublication.js";
import LensComponent from "../components/lensComponent.js";
import axios from "axios";
import { config } from "dotenv";
import type { NextPage } from "next";

const Home: NextPage = () => {
  // Assuming createPost is in the same file, otherwise import it
  const [postText, setProfileName] = useState("");
  const [url, setUrl] = useState("");

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
        const postData = { text: url };
        const response = await createPost(postData);

        console.log(response);
        // Do something with response or show success message...
      } catch (error) {
        // Handle error...
      }
    };

    return (
      <div>
        <textarea value={url} onChange={handleChange} style={{ color: "black" }} />
        <br />
        <button onClick={handleCreatePost}>Create Post</button>
      </div>
    );
  };

  const ProfileCreator = () => {
    const [postText, setProfileName] = useState("");
    const [url, setUrl] = useState("");

    const handleCreateProfile = async () => {
      try {
        const postData = { handle: postText, profilePictureUri: url };
        const response = await createProfile(postData);

        console.log(response);
        // Do something with response or show success message...
      } catch (error) {
        // Handle error...
      }
    };

    return (
      <div>
        <textarea value={postText} onChange={e => setProfileName(e.target.value)} style={{ color: "black" }} />
        <textarea value={url} onChange={e => setUrl(e.target.value)} style={{ color: "black" }} />
        <br />
        <button onClick={handleCreateProfile}>Create Profile</button>
      </div>
    );
  };

  const createPost = async (postData: any) => {
    try {
      const response = await axios.post("http://localhost:8546/users/postThingy", postData);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const createProfile = async (postData: any) => {
    try {
      const response = await axios.post("http://localhost:8546/create", postData);
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
        <Feed />
        <ProfileCreator />
        <PostCreator />
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
