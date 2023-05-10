import { serviceReturnForm } from '../modules/responseHandler';
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import *  as profileService from '../services/profileService';
import * as jwt from '../middleware/auth';

/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
export const userProfile = async (req: Request, res: Response) => {
  //get data from JWT token
  const accessToken = (req.headers.access as string).split('Bearer ')[1];
  const authResult = jwt.verify(accessToken);
  const decoded = jwt.decode(accessToken);
  console.log(decoded);
  if (authResult.state) {
      const returnData: serviceReturnForm = await profileService.getProfile(decoded!.id);
      res.status(returnData.status).send(returnData);
    }
}

//profile update
export const profileUpdate = async (req: Request, res: Response) => {
  const accessToken = (req.headers.access as string).split('Bearer ')[1];
  const authResult = jwt.verify(accessToken);
  const decoded = jwt.decode(accessToken);
  console.log(decoded);
  const {  nickname, phoneNumber } = req.body;
  const returnData: serviceReturnForm = await profileService.updateProfile(nickname, phoneNumber, decoded!.id);
  res.status(returnData.status).send(returnData);
}