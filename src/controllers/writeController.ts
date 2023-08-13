import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as WriteService from '../services/writeService';
import { newChallengeRequestDto, newChallengeResponseDto } from '../interfaces/writeDTO';
import { ErrorResponse, SuccessResponse } from '../modules/returnResponse';

/**
 * 새 챌린지 시작 
 * @param req 챌린지 이름
 * @param res 
 * @returns 
 *            1. 서버오류(500)
 *            2. 이미 진행 중인 챌린지(415)
 *            3. 챌린지 수 초과(418)
 *            4. 데이터 반환 : 유저의 해당 챌린지 데이터와 시작한 챌린지 템플릿( 200)
 */
export const newChallenge = async (req: Request<newChallengeRequestDto>, res: Response<newChallengeResponseDto>) => {
    try {

        const newChallenge = req.params.name;
        const newChallengeData = await WriteService.newChallengeData(req.decoded?.id);
        const challengesCount = newChallengeData?.challengesCountDB._count.uchal_id;
        const chalIdData = await WriteService.selectChallenge(newChallenge);

        if (chalIdData == undefined) {
            return
        }

        const challengePossible = await WriteService.userChallengeSelect(req.decoded?.id, chalIdData[0].chal_id)

        if (challengePossible?.uchal_id === undefined) {

            if (!newChallengeData?.userCooponDB?.coopon) {
                if (2 <= challengesCount!) {
                    return new ErrorResponse(418, "더 이상 챌린지를 할 수 없습니다.").sendResponse(res);
                }
            }

            await WriteService.startChallenge(req.decoded?.id, chalIdData[0].chal_id);

            const data = await WriteService.newChallengeResult(req.decoded?.id, chalIdData[0].chal_id);
            const relativeChallengeArray = [];
            const challengTemplate = data?.challengTemplateDB.map((e) => {
                const transformedTemplates = e.templates.map((template) => ({
                    templateTitle: template.title,
                    templateContent: template.content,
                    category: e.category.name,
                    image: e.category.emogi
                }));

                return transformedTemplates;
            }).flat();

            for (var i = 0; i < data!.relativeChallengeDBFirst.length; i++) {
                if (!data?.relativeChallengeDBFirst[i].user_challenge_templetes[0]) {
                } else {
                    const relativeChallengeMap = data.relativeChallengeDBFirst.map((e) => {
                        return { challengeName: e.challenges.title, category: e.challenges.category.name };
                    });
                    relativeChallengeArray.push(relativeChallengeMap[i]);
                }
            }

            for (var i = 0; i < data!.relativeChallengeDBSecond.length; i++) {
                if (!data!.relativeChallengeDBSecond[i].user_challenge_templetes[0]) {
                    const relativeChallengeMap = data!.relativeChallengeDBSecond.map((e) => {
                        return { challengeName: e.challenges.title, category: e.challenges.category.name };
                    });
                    if (relativeChallengeArray.indexOf(relativeChallengeMap[i]) === -1) {
                        relativeChallengeArray.push(relativeChallengeMap[i]);
                    }
                }
            }

            const userChallenging = [
                ...relativeChallengeArray.filter(item => item.challengeName === newChallenge),
                ...relativeChallengeArray.filter(item => item.challengeName !== newChallenge)
            ];

            return new SuccessResponse(
                200,
                "OK",
                {
                    challengingArray: userChallenging,
                    templateData: {
                        challengeName: newChallenge,
                        challengeCategory: relativeChallengeArray[0]?.category,
                        templates: challengTemplate
                    }
                }
            ).sendResponse(res)
        }
        return new ErrorResponse(415, "현재 진행 중인 챌린지와 중복됩니다.").sendResponse(res);
    } catch (error) {
        console.error(error);
        return new ErrorResponse(500, "Server Error").sendResponse(res);
    }
};


export const writeChallenge = async (req: any, res: Response) => {
    try {
        const writeChallenge = await WriteService.writeChallengeData(req.decoded.id);
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
            var writeTemplate: any = await WriteService.writeTemplateData(challengeChalIdyArray[0]);
        }
        else {
            var writeTemplate: any =
                await WriteService.writeTemplateData(challengeChalIdyArray[0],
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
            await WriteService.insertTemporaryChallengeData(req.decoded.id,
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
            await WriteService.insertChallengeCompleteData(
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
        const data = await WriteService.selectTemplateData(challengeName, req.decoded.id);

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







