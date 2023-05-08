import { serviceReturnForm } from '../modules/responseHandler';
import { profileService } from '../services/profileService';
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';

/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
export const userProfile = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const returnData: serviceReturnForm = await profileService.profileService(userId);
  res.status(returnData.status).send(returnData);
}
