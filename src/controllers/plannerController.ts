import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from '../modules/jwtModules';
import *  as plannerService from '../services/plannerService.js';
import { ErrorResponse, SuccessResponse } from '../modules/returnResponse.js';
import { getUserChallengeResponseDto, getUserChallengeTemplateRequestDto, getUserChallengeTemplateResponseDto, userChallengeDto } from '../interfaces/plannerDTO.js';
import { getKoreanDateISOString } from '../modules/koreanTime.js';
import { stream, logger } from '../modules/loggerHandler.js';



// controller function which give data to router, it receives userid, startdate, finishdate and returns user's completed challenges within the specified date range
export async function getPlannerData(req: any, res: Response, next: NextFunction) {
    try {


        const startDate = req.query.startDate as string;
        const finishDate = req.query.finishDate as string;
        const userId: number = req.decoded?.id;

        const completedChallengesDate = await plannerService.getCompletedChallenges(userId, startDate, finishDate);

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
        if (error instanceof Error) {
            logger.error(error.stack); 
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }  
    }
}

// getUserStatistics data controller which returns the number of challenges solved by the user in a month or week use period
export async function getUserStatistics(req: any, res: Response, next: NextFunction) {
    try {



        const { period } = req.query;
        const userId: number = req.decoded?.id;
        const userStatistics = await plannerService.getUserStatistics(userId, <string>period);


        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                userStatistics
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack); 
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }  
    }
}


// getuserhistory data controller
export async function getUserChallengeHistory(req: any, res: Response, next: NextFunction) {
    try {


        const userId: number = req.decoded?.id;
        const userChallengeHistory = await plannerService.getUserChallengeHistory(userId);

        // 사용자 기록이 없다면 가능한 챌린지들 보여주기

        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                userChallengeHistory
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack); 
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }  
    }
}

/**
 * 
 * @param req 유저 id
 * @param res 
 * @param next 
 * @returns  1. 참여한 챌린지가 없다.
 *           2. 진행 중인, 종료한 챌린지 데이터
 *           3. 서버 오류
 */
export const getUserChallenge = async (req: Request, res: Response<getUserChallengeResponseDto>, next: NextFunction) => {
    try {


        const userId: number = req.decoded?.id;
        const onGoingChallenge : userChallengeDto = [];
        const finishChallenge : userChallengeDto = [];
        const userChallengeDB = await plannerService.getUserChallengeData(userId);
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString);

        if (userChallengeDB[0] === undefined) {
            return new ErrorResponse(403, "참여한 챌린지가 없습니다.").sendResponse(res);
        }


        userChallengeDB.forEach((e) => {
            const transformedValue = {
                complete: e.complete,
                remain_day: e.finish_at ? Math.floor((new Date(e.finish_at).getTime() - koreanTime.getTime()) / (1000 * 3600 * 24)) + 1: null,
                challengeTitle: e.challenges.title,
                categoryName: e.challenges.category.name
            };

            if (e.complete) {
                finishChallenge.push(transformedValue);
            } else {
                onGoingChallenge.push(transformedValue);
            }
        });


        return new SuccessResponse(200, "OK", {
            onGoingChallenge,
            finishChallenge
        }).sendResponse(res);



    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack); 
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }  
    }
}


/**
 * 
 * @param req 챌린지 이름, 유저 id
 * @param res 
 * @param next 
 * @returns  1. 작성 템플릿이 없다.
 *           2. 챌린지 템플릿 데이터
 *           3. 서버 오류
 */
export const getUserChallengeTemplate = async (req: Request<getUserChallengeTemplateRequestDto>, res: Response<getUserChallengeTemplateResponseDto>, next: NextFunction) => {
    try {


        const userId: number = req.decoded?.id;
        const challenge = req.params.challenge;
        const userChallengeTemplateArray = [];

        const userChallengeTemplateDB = await plannerService.getUserChallengeTemplateData(userId, challenge);

        if (userChallengeTemplateDB[0].user_challenges[0].user_challenge_templetes[0] === undefined) {
            return new ErrorResponse(403, "작성 템플릿이 없습니다.").sendResponse(res);
        }
        const category = userChallengeTemplateDB[0].category.name;
        const userChallengeTemplate = userChallengeTemplateDB[0].user_challenges[0].user_challenge_templetes;

        console.log(userChallengeTemplate)

        for(let i = 0; i < userChallengeTemplate.length; i++){

            const dateString = userChallengeTemplate[i].created_at; 
            const date = new Date(dateString); 
            
            const year = date.getFullYear().toString().slice(-2); 
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
            const day = date.getDate().toString().padStart(2, '0'); 
            const parsedDateStr = `${year}.${month}.${day}`;
            

     //       userChallengeTemplate[i].created_at = parsedDateStr;

        }


        return new SuccessResponse(200, "OK", {
            category,
            userChallengeTemplate
        }).sendResponse(res);

    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack); 
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }  
    }
}