import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from '../middleware/auth';
import *  as plannerService from '../services/plannerService';

const prisma = new PrismaClient();

// controller function which give data to router, it receives userid, startdate, finishdate and returns user's completed challenges within the specified date range
export async function getPlannerData(req: Request, res: Response, next: NextFunction) {
    try {
        //아래 부분은 미들웨어로 빼야함
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = await jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        const userId = decoded!.id;

        const startDate = req.query.startDate as string
        const finishDate = req.query.finishDate as string

        // Fetch completed challenges for the given user use service function
        const completedChallengesDate = await plannerService.getCompletedChallenges(userId, startDate, finishDate);
        console.log(completedChallengesDate);

        // Process completed challenges and extract the completion dates
        // const completedDates = completedChallengesDate.map((challenge: { chal_id: number; finish_at: string }) => {
        //     return {
        //         chalId: challenge.chal_id,
        //         completionDate: challenge.finish_at,
        //     };
        // }

        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                completedChallengesDate
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
export async function getUserChallengeHistory(req: Request, res: Response, next: NextFunction) {
    try {
        //아래 부분은 미들웨어로 빼야함
        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = await jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        const userId = decoded!.id;

        const userChallengeHistory = await plannerService.getUserChallengeHistory(userId);
        console.log(userChallengeHistory);

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

