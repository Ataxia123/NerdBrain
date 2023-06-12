import express from "express";
import { urlencoded, json } from "body-parser";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import {login} from "./lensControllers/index.js";
import cors from 'cors';

const { config } = dotenv;

config();
const app = express();
app.use(cors());
app.use(urlencoded({"extended": false}));
app.use(json());
app.use(routes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, async err => {
    if (err) {
      console.log(`Connection to server at port ${PORT} has failed.`);
    } else {
      console.log(`Connection to server at port ${PORT} is successful.`);
      try {
          const {accessToken, refreshToken} = await login();
          console.log('Access token:', accessToken, 'Refresh token:', refreshToken);
      } catch (error) {
          console.log('Error making API call on startup:', error);
      }
    }
  });
  