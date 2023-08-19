import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from '../modules/jwtModules';
import *  as plannerService from '../services/plannerService';




// controller function which give data to router, it receives userid, startdate, finishdate and returns user's completed challenges within the specified date range
export async function getPlannerData(req: any, res: Response, next: NextFunction) {
    try {


        const startDate = req.query.startDate as string;
        const finishDate = req.query.finishDate as string;

        const completedChallengesDate = await plannerService.getCompletedChallenges(req.decoded?.id, startDate, finishDate);

        // if error occurs, return 500 error
        if (!completedChallengesDate) {
            return res.status(500).json({
                "code": 500,
                "message": "Server Error fetching completedChallengesDate",
            });
        }
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                completedChallengesDate,
            },
        });
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error",
        });
    }
}

// getUserStatistics data controller which returns the number of challenges solved by the user in a month or week use period
export async function getUserStatistics(req: any, res: Response, next: NextFunction) {
    try {

    

        const { period } = req.query;
        const userStatistics = await plannerService.getUserStatistics(req.decoded?.id,<string>period);


        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                userStatistics
            }
        });
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
}


// getuserhistory data controller
export async function getUserChallengeHistory(req: any, res: Response, next: NextFunction) {
    try {

        const userChallengeHistory = await plannerService.getUserChallengeHistory(req.decoded?.id);

        // 사용자 기록이 없다면 가능한 챌린지들 보여주기

        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                userChallengeHistory
            }
        });
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
}

