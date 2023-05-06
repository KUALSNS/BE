require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/challengeService';

export const beforeMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ChallengeController.beforeMainData();
        return res.status(200).json({
            "code" : 200,
            "message" : "Ok",
             data
      
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
};

export const wholeCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const challenges = await ChallengeController.wholeCategoryData();
        return res.status(200).json({
            "code" : 200,
            "message" : "Ok",
             data :{
                challenges
             }   
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
};