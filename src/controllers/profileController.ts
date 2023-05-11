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
  try {
    //get data from JWT token
    const accessToken = (req.headers.access as string).split('Bearer ')[1];
    const authResult = jwt.verify(accessToken);
    const decoded = jwt.decode(accessToken);
    console.log(decoded);
    if (authResult.state) {
      const returnData: serviceReturnForm = await profileService.getProfile(decoded!.id);
      res.status(returnData.status).send(returnData);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Fail Get Profile" });
  }

}

// update email function with verification using typescript
export const emailUpdate = async (req: Request, res: Response) => {
    try {
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        console.log(decoded);
        const { email } = req.body;
        const returnData: serviceReturnForm = await profileService.updateEmail(email, decoded!.id);
        return res.status(returnData.status).send(returnData);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, message: "Fail Update Email" });
    }
}



// password update function with verification using typescript body input oldPassword, newPassword
export const passwordUpdate = async (req: Request, res: Response) => {
    try {
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        console.log(decoded);
        const { oldPassword, newPassword } = req.body;
        const returnData: serviceReturnForm = await profileService.updatePassword(oldPassword, newPassword, decoded!.id);
        res.status(returnData.status).send(returnData);
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Fail Update Password" });
    }
}

//profile update
export const profileUpdate = async (req: Request, res: Response) => {
  try {
    const accessToken = (req.headers.access as string).split('Bearer ')[1];
    const authResult = jwt.verify(accessToken);
    const decoded = jwt.decode(accessToken);
    console.log(decoded);
    const {  nickname, phoneNumber } = req.body;
    const returnData: serviceReturnForm = await profileService.updateProfile(nickname, phoneNumber, decoded!.id);
    res.status(returnData.status).send(returnData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Fail Update Profile" });
  }

}