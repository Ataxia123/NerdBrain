import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { NextFunction, Response } from 'express';
import { createClient } from 'urql';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { RequestWithUser } from '@/interfaces/auth.interface';
import fetch from 'cross-fetch';
import { authenticate, challenge } from '../queries/querys.js';
import { logger, stream } from '@utils/logger';
import { isCreateDataAvailabilityPublicationResult } from '@lens-protocol/client';
import { getAuthenticatedClient } from '../scripts/shared/getAuthenticatedClient';
import { setupWallet } from '../scripts/shared/setupWallet';
import { uploadWithBundlr } from '../scripts/shared/uploadWithBundlr';
import { getActiveProfile } from '../scripts/shared/getActiveProfile';
import { buildPublicationMetadata } from '../scripts/shared/buildPublicationMetadata';
import { createPost } from '../scripts/createGatedPost';

const { config } = dotenv;
config();

// const serverAddress = process.env.SERVER_WALLET_ADDRESS;
// const privateKey = process.env.SERVER_PRIVATE_KEY;
// let accessToken = process.env.ACCESS_TOKEN;
// const APIURL = 'https://api-mumbai.lens.dev/';
// const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
// const signer = new ethers.Wallet(privateKey, provider);
// const address = signer.address;

// let accessTokenExpiration = Number(process.env.ACCESS_TOKEN_EXPIRATION);
// let refreshToken = null;
// let tokenExpiry = null;

const urlValidator = (req, res, next) => {
  const urlRegex = /^https:\/\/chat\.openai\.com\/share\/[\w-]+$/;

  const { url } = req.body;

  if (!urlRegex.test(url)) {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  next();
};

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const users: User[] = UserModel;
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: User): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { ...userData, id: UserModel.length + 1, password: hashedPassword };

    return createUserData;
  }

  public async updateUser(userId: number, userData: User): Promise<User[]> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    const updateUserData: User[] = UserModel.map((user: User) => {
      if (user.id === findUser.id) user = { ...userData, id: userId, password: hashedPassword };
      return user;
    });

    return updateUserData;
  }

  public async postMessage(text: string) {
    try {
      createPost(text);
    } catch (error) {
      console.error('Error in postThingy: ', error.message);
    }
  }

  public async deleteUser(userId: number): Promise<User[]> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData: User[] = UserModel.filter(user => user.id !== findUser.id);
    return deleteUserData;
  }
}
