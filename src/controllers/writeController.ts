import { createRequire } from 'module'
const require = createRequire(import.meta.url)

require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as WriteService from '../services/writeService';
import { ChallengeCategoryDB, newChallengeRequestDto, newChallengeResponseDto, selectTemplateRequestDto, writeChallengeResponseDto } from '../interfaces/writeDTO';
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


export const writeChallenge = async (req: any, res: Response<writeChallengeResponseDto>) => {
    try {
        const writeChallenge = await WriteService.writeChallengeData(req.decoded.id);

        const challengingArray = [];
        const challengeChalIdyArray = [];
        let writeTemplate;
        let temporaryChallenge: { title: string | null; writing: string; }[] | undefined;


        const challengeArray = challengeRelativeMapping(writeChallenge.challengeCategoryDBFirst, writeChallenge.challengeCategoryDBSecond);



        if (challengeArray[0] == undefined) {
            return new ErrorResponse(404, "오늘은 더 이상 진행할 챌린지가 없습니다").sendResponse(res);
        }

        for (const e of challengeArray) {
            challengingArray.push({ "challengeName": e.challenges.title, "category": e.challenges.category.name });
            challengeChalIdyArray.push(e.chal_id);
        }

        if (challengeArray[0].user_challenge_templetes[0] == undefined) {                    // 값이 없다면
            writeTemplate = await WriteService.writeTemplateData(challengeChalIdyArray[0]);
            console.log(writeTemplate)
            temporaryChallenge = [];
        }
        else {
            writeTemplate = await WriteService.writeTemplateData(challengeChalIdyArray[0], challengeArray[0].user_challenge_templetes[0].uctem_id);
            temporaryChallenge = writeTemplate!.temporaryChallengeDB?.map((e) => {
                return {
                    "title": e.title,
                    "writing": e.writing
                }
            })
        }

        const category = writeTemplate.categoryDB;
        let templateCertain: boolean;

        const templates = writeTemplate.challengeTemplateDB.map((e) => {
            return { "templateTitle": e.title, "templateContent": e.content, "category": e.challenges.category.name, "image": e.challenges.category.emogi }
        });

        if (temporaryChallenge![0] == undefined) {
            templateCertain = false;
        }
        else {
            templateCertain = true;
        }

        return new SuccessResponse(200, "OK", {
            templateCertain,
            temporaryChallenge,
            challengingArray,
            templateData: {
                challengeName: challengingArray[0].challengeName,
                challengeCategory: category[0].category.name,
                templates
            }
        }).sendResponse(res);

    } catch (error) {
        console.error(error);
        return new ErrorResponse(500, "Server Error").sendResponse(res);
    }
};


export const selectTemplate = async (req: Request<selectTemplateRequestDto>, res: Response) => {
    try {
        const challengeName = req.params.challengeName;
        const writeChallenge = await WriteService.writeChallengeData(req.decoded?.id);

     //   const challengeArrayData = challengeRelativeMapping(writeChallenge.challengeCategoryDBFirst, writeChallenge.challengeCategoryDBSecond);
        
        const challengeIdCategoryData = await WriteService.selectChallenge(challengeName); 

        const templateAndChallengeIddData = await WriteService.selectTemplateData(challengeIdCategoryData, req.decoded?.id);

        const challengingData = await WriteService.challengingData(templateAndChallengeIddData.challengeIdDB[0].uchal_id);

        let templateCertain: boolean;
        const userChallenging: { challengeName: string; category: string; }[] = [];

        const challengeArray = [];

        // challengeArrayData.forEach(e => {
        //     const challengeMap = { "challengeName": e.challenges.title, "category": e.challenges.category.name };
        //     if (!userChallenging.some(existingChallenge => existingChallenge.challengeName === challengeMap.challengeName)) {
        //         userChallenging.push(challengeMap);
        //     }
        // });
        console.log(writeChallenge.challengeCategoryDBFirst[1].user_challenge_templetes[0])


        for (var i = 0; i < writeChallenge.challengeCategoryDBFirst.length; i++) {
            if ( writeChallenge.challengeCategoryDBFirst[i].user_challenge_templetes[0] !== undefined) {
                challengeArray.push(writeChallenge.challengeCategoryDBFirst[i]);
            } 
          
            
        }
        for (var i = 0; i < writeChallenge.challengeCategoryDBSecond.length; i++) {
            if (writeChallenge.challengeCategoryDBSecond[i].user_challenge_templetes[0] === undefined) {
                if (challengeArray.indexOf(writeChallenge.challengeCategoryDBSecond[i]) === -1) {
                    challengeArray.push(writeChallenge.challengeCategoryDBSecond[i]);
                }
            }
        }
   



        for (var i = 0; i < challengeArray.length; i++) {
            const ChallengeMap = challengeArray.map((e) => {
                return { "challengeName": e.challenges.title, "category": e.challenges.category.name };
            });
            if (userChallenging.indexOf(ChallengeMap[i]) === -1) {
                userChallenging.push(ChallengeMap[i]);
            }

        }

        // for (var i = 0; i < challengeArrayData.length; i++) {
        //     const ChallengeMap = challengeArrayData.map((e) => {
        //         return { "challengeName": e.challenges.title, "category": e.challenges.category.name };
        //     });
        //     if (userChallenging.indexOf(ChallengeMap[i]) === -1) {
        //         userChallenging.push(ChallengeMap[i]);
        //     }

        // }

      

        const challengingArray = [
            ...userChallenging.filter(item => item.challengeName === challengeName),
            ...userChallenging.filter(item => item.challengeName !== challengeName)
        ];

       
        console.log(challengingArray)



        for (var i = 0; i < templateAndChallengeIddData.templateNameDB.length; i++) {
            var category = challengeIdCategoryData.map((e) => {
                return { "category": e.category.name, "image": e.category.emogi };
            });
            templateAndChallengeIddData.templateNameDB[i].category = category[0].category;
            templateAndChallengeIddData.templateNameDB[i].image = category[0].image;
        }

        const templates = templateAndChallengeIddData.templateNameDB.map((e) => {
            return { "templateTitle": e.title, "templateContent": e.content, "category": e.category, "image": e.image };

        });

        const temporaryChallenge = challengingData.map((e) => {
            return {
                "title": e.title,
                "writing": e.writing,
                "userChallenge": e.user_challenges.challenges.title
            }
        });


        if (temporaryChallenge[0] == undefined) {
            templateCertain = false
        }
        else {
            templateCertain = true
        }

        const challengeCategory = challengeIdCategoryData[0].category.name;

        const templateData = { "challengeName": challengeName, "challengeCategory": challengeCategory, "templates": templates };




        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
                templateCertain,
                temporaryChallenge,
                challengingArray,
                templateData

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

export const insertChallengeComplete = async (req: Request, res: Response) => {
    try {
        const { challengeName, challengeTitle, challengeContent } = req.body;

        const data =
            await WriteService.insertChallengeCompleteData(
                req.decoded?.id,
                challengeName,
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




function challengeRelativeMapping(challengeCategoryDBFirst: ChallengeCategoryDB[], challengeCategoryDBSecond: ChallengeCategoryDB[]) {

    const challengeArray = [];

    for (var i = 0; i < challengeCategoryDBFirst.length; i++) {
        if (!challengeCategoryDBFirst[i].user_challenge_templetes[0]) {
        } else {
            challengeArray.push(challengeCategoryDBFirst[i]);
        }
    }
    for (var i = 0; i < challengeCategoryDBFirst.length; i++) {
        if (!challengeCategoryDBFirst[i].user_challenge_templetes[0]) {
            if (challengeArray.indexOf(challengeCategoryDBFirst[i]) === -1) {
                challengeArray.push(challengeCategoryDBFirst[i]);
            }
        }
    }

    return challengeArray;

}





