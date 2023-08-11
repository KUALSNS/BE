import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/writeService';
import { imagesArrayDTO, videoArrayDTO } from '../interfaces/DTO'
import { getKoreanDateISOStringAdd9Hours } from '../modules/koreanTime';
import { IFile } from '../interfaces/express';


export const newChallenge = async (req: any, res: Response) => {
    try {
        const koreanDateISOString2 = getKoreanDateISOStringAdd9Hours();
        const koreanTime2 = new Date(koreanDateISOString2)
        console.log(koreanTime2);
        const newChallenge: string = req.params.name;
        const data = await ChallengeController.newChallengeData(req.decoded.id, newChallenge);
        const challengesCount: number = data?.challengesCount as number;
        const challengesOverlap: any = data?.challengesOverlap as any;
        if (data?.coopon) {
            if (challengesOverlap == undefined) {
                const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                if (startChallenge) {
                    const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                    return res.status(200).json({
                        "code": 200,
                        "message": "OK",
                        "data": {
                            "challengingArray": data.userChallenging,
                            templateData: {
                                challengeName: startChallenge.newChallenge,
                                challengeCategory: data.userChallenging[0].category,
                                templates: data.challengTemplateArray
                            }
                        }
                    });
                }
            }
            else {
                return res.status(415).json({
                    "code": 415,
                    "message": "현재 진행 중인 챌린지와 중복됩니다.",
                });
            }
        } else {
            if (2 <= challengesCount) {
                return res.status(418).json({
                    "code": 418,
                    "message": "더 이상 챌린지를 할 수 없습니다.",
                });
            } else {
                if (challengesOverlap == undefined) {
                    const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                    if (startChallenge) {
                        const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                        return res.status(200).json({
                            "code": 200,
                            "message": "OK",
                            "data": {
                                "challengingArray": data.userChallenging,
                                templateData: {
                                    challengeName: startChallenge.newChallenge,
                                    challengeCategory: data.userChallenging[0].category,
                                    templates: data.challengTemplateArray
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

export const writeChallenge = async (req: any, res: Response) => {
    try {
        const writeChallenge = await ChallengeController.writeChallengeData(req.decoded.id);
        const challengeCategoryDB = writeChallenge?.challengeArray;
        const challengingArray = [];
        const challengeChalIdyArray = [];

        if (writeChallenge?.challengeArray[0] == undefined) {
            return res.status(404).json({
                "code": 404,
                "message": "오늘은 더 이상 진행할 챌린지가 없습니다",
            });
        }
        for (var i = 0; i < challengeCategoryDB!.length; i++) {
            const challengeMap = challengeCategoryDB!.map((e) => {
                return { "title": e.challenges, "chal_id": e.chal_id, "category": e.challenges.category.name };
            });
            challengingArray.push({ "challengeName": challengeMap[i].title.title, "category": challengeMap[i].category });
            challengeChalIdyArray.push(challengeMap[i].chal_id);
        }

        if (writeChallenge?.challengeArray[0].user_challenge_templetes[0] == undefined) {  // 값이 없다면
            var writeTemplate: any = await ChallengeController.writeTemplateData(challengeChalIdyArray[0]);
        }
        else {
            var writeTemplate: any =
                await ChallengeController.writeTemplateData(challengeChalIdyArray[0],
                    writeChallenge?.challengeArray[0].user_challenge_templetes[0].uctem_id);

        }
        const template = writeTemplate?.challengeTemplateDB;
        const category = writeTemplate?.categoryDB;
        const temporaryChallenge = writeTemplate.temporaryChallenge;
        let templateCertain: boolean;

        const templates = template.map((e: any) => {
            return { "templateTitle": e.title, "templateContent": e.content, "category": e.challenges.category.name, "image": e.challenges.category.emogi }
        });

        console.log(temporaryChallenge[0]);


        if (temporaryChallenge[0] == undefined) {
            templateCertain = false;
        }
        else {
            templateCertain = true;

        }
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "data": {
                templateCertain,
                temporaryChallenge,
                challengingArray,
                templateData: {
                    challengeName: challengingArray[0].challengeName,
                    challengeCategory: category[0].category.name,
                    templates
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

export const insertTemporaryChallenge = async (req: any, res: Response) => {
    try {
        const { challengeName, templateName, challengeTitle, challengeContent } = req.body;

        const data =
            await ChallengeController.insertTemporaryChallengeData(req.decoded.id,
                challengeName,
                templateName,
                challengeTitle,
                challengeContent
            );
        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const insertChallengeComplete = async (req: any, res: Response) => {
    try {
        const { challengeName, templateName, challengeTitle, challengeContent } = req.body;

        const data =
            await ChallengeController.insertChallengeCompleteData(
                req.decoded.id,
                challengeName,
                templateName,
                challengeTitle,
                challengeContent
            );
        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const selectTemplate = async (req: any, res: Response) => {
    try {
        const challengeName = req.params.challengeName;
        const data = await ChallengeController.selectTemplateData(challengeName, req.decoded.id);

        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                data
            });

        }
        return res.status(404).json({
            "code": 404,
            "message": "not found"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};
















