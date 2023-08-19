import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import { serviceReturnForm } from '../modules/responseHandler';
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import *  as profileService from '../services/profileService';
import * as jwt from '../modules/jwtModules';

/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
export const userProfile = async (req: Request, res: Response) => {
  try {
      console.log("here")

      //get data from JWT token
    const accessToken = (req.headers.access as string).split('Bearer ')[1];
    const authResult = jwt.verify(accessToken);
    const decoded = jwt.decode(accessToken);
    console.log(decoded);
    if (authResult.state) {
        console.log("here")
      const returnData: serviceReturnForm = await profileService.getProfile(decoded!.id);
        return res.status(returnData.status).send(returnData);
    }
  } catch (error) {
    console.log(error);
      return res.status(500).send({ status: 500, message: "Fail Get Profile" });
  }

}

export const couponActivation = async (req: Request, res: Response) => {
    try {
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        console.log(decoded);
        const { couponCode } = req.body;
        const returnData: serviceReturnForm = await profileService.couponActivation( decoded!.id,parseInt(couponCode),);
        return res.status(returnData.status).send(returnData);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, message: "Fail Coupon Activation" });
    }
}



export const userChallengeStatistics = async (req: Request, res: Response) => {
    try {
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        console.log(decoded);
        const { year, month, week,period } = req.query;
        const returnData: serviceReturnForm = await profileService.getChallengeStatistics(<string>year, <string>month, <string>week,<string>period, decoded!.id);
        return res.status(returnData.status).send(returnData);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, message: "Fail Get Challenge Statistics" });
    }
}




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

export const profileUpdate = async (req: Request, res: Response) => {
  try {
    const accessToken = (req.headers.access as string).split('Bearer ')[1];
    const authResult = jwt.verify(accessToken);
    const decoded = jwt.decode(accessToken);
    console.log(decoded);
    const {  nickname, phoneNumber, marketingAgreement } = req.body;
    const returnData: serviceReturnForm = await profileService.updateProfile(nickname, phoneNumber, marketingAgreement,decoded!.id);
    res.status(returnData.status).send(returnData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Fail Update Profile" });
  }

}