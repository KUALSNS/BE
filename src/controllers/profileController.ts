import { serviceReturnForm } from '../modules/responseHandler';
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import *  as profileService from '../services/profileService';

/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
export const userProfile = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const returnData: serviceReturnForm = await profileService.getProfile(userId);
  res.status(returnData.status).send(returnData);
}

//profile update
export const profileUpdate = async (req: Request, res: Response) => {
  const {  nickname, phoneNumber } = req.body;
  const returnData: serviceReturnForm = await profileService.updateProfile(nickname, phoneNumber);
  res.status(returnData.status).send(returnData);
}