require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/writeService';


export const newChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const newChallenge: string = req.params.name;
        const data = await ChallengeController.newChallengeData(req.decoded.id, newChallenge);
        const challengesCount: number = data?.challengesCount as number;
        const challengesOverlap: any = data?.challengesOverlap as any;
        if (data?.coopon) {       //트루
            console.log(!challengesOverlap)
            if (!challengesOverlap) {    // 중복되지 않음
                return res.status(415).json({
                    "code": 415,
                    "message": "현재 진행 중인 챌린지와 중복됩니다.",
                });
               
            }
            else {         
                const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                if (startChallenge) {
                    const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                    return res.status(200).json({
                        "code": 200,
                        "message": "OK",
                        "data": {
                            "challengeName": data.valueFilter,
                             templateData: {
                                challengeName: startChallenge.newChallenge,
                                template : data.challengTemplateArray
                            }
                        }
                    });
                }
            }
        } else {
            if (2 < challengesCount) {        // 챌린지 갯수 초과
                return res.status(418).json({
                    "code": 418,
                    "message": "더 이상 챌린지를 할 수 없습니다.",
                });
            } else {
                if (challengesOverlap == undefined) {
                    const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                    if (startChallenge) {
                        const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                        console.log(data)
                        return res.status(200).json({
                            "code": 200,
                            "message": "OK",
                            "data": {
                                "challengeName": data.valueFilter,
                                templateData: {
                                    challengeName: startChallenge.newChallenge,
                                    template : data.challengTemplateArray
                                }
                            }
                        });
                    }
                } else {
                    return res.status(415).json({
                        "code": 415,
                        "message": "현재 진행 중인 챌린지와 중복됩니다.",
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};


export const writeChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const writeChallenge = await ChallengeController.writeChallengeData(req.decoded.id);
        const challengeCategoryDB = writeChallenge?.challengeCategoryDB;
        const challengeCategoryArray = [];
        const challengeChalIdyArray = [];

        for (var i = 0; i < challengeCategoryDB!.length; i++) {
            if (!challengeCategoryDB![i].user_challenge_templetes[0]) {
                const challengeMap = challengeCategoryDB!.map((e) => {
                    return { "title": e.challenges, "chal_id": e.chal_id };
                });
                console.log(challengeMap)
                challengeCategoryArray.push(challengeMap[i].title.title);
                challengeChalIdyArray.push(challengeMap[i].chal_id);
            }
        }
        const writeTemplate = await ChallengeController.writeTemplateData(challengeChalIdyArray[0]);
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "data": {
                challengeCategoryArray,
                templateData: {
                    challengeName: challengeCategoryArray[0],
                    writeTemplate
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};













