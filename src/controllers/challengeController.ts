require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/challengeService';



export const beforeMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ChallengeController.beforeMainData();
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
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
            "code": 200,
            "message": "Ok",
            data: {
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

export const oneCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oneCategory = req.params.category;
        const challenges = await ChallengeController.oneCategoryData(oneCategory);
        if (challenges) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                data: {
                    challenges
                }
            });
        } else {
            return res.status(404).json({
                "code": 404,
                "message": "not found"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
};

export const manyCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manyCategory: string[] | string = req.query.category as string[] | string;
        const challenges = await ChallengeController.manyCategoryData(manyCategory);
        if (challenges!) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                data: {
                    challenges
                }
            });
        } else {
            return res.status(404).json({
                "code": 404,
                "message": "not found"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
};

export const challengeSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categorySearch: string = req.query.categorySearch as string;
        const challenges = await ChallengeController.challengeSearchData(categorySearch);
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            data: {
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

export const afterMain = async (req: any, res: Response, next: NextFunction) => {
    try {

        const data = await ChallengeController.afterMainData(req.decoded.id);

        const nickname = data?.nickname;
        const coopen = data?.coopon;
        const userChallengeSu = data?.userChallengeSu;
        const userChallengeCountArray = data?.userChallengeCountArray
        const category = data?.category;
        const challengesArray = data?.challengesArray;

        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "data": {
                nickname,
                coopen,
                userChallengeSu,
                userChallengeCountArray,
                category,
                challengesArray
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

// export const newChallenge = async (req: any, res: Response, next: NextFunction) => {
//     try {
//         const newChallenge: string = req.params.name;
//         const data = await ChallengeController.newChallengeData(req.decoded.id, newChallenge);
//         const challengesCount: number = data?.challengesCount as number;
//         const challengesOverlap: any = data?.challengesOverlap as any;
//         if (data?.coopon) {       //트루
//             if (challengesOverlap == undefined) {    // 중복되지 않음
//                 const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
//                 if (startChallenge) {
//                     const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
//                     return res.status(200).json({
//                         "code": 200,
//                         "message": "OK",
//                         "data": {
//                             "challengeName": data.valueFilter,
//                             "selectChallengeTemplate": data.challengTemplateArray
//                         }
//                     });
//                 }
//             }
//             else {
//                 return res.status(415).json({
//                     "code": 415,
//                     "message": "현재 진행 중인 챌린지와 중복됩니다.",
//                 });
//             }
//         } else {
//             if (2 < challengesCount) {        // 챌린지 갯수 초과
//                 return res.status(418).json({
//                     "code": 418,
//                     "message": "더 이상 챌린지를 할 수 없습니다.",
//                 });
//             } else {
//                 if (challengesOverlap == undefined) {
//                     const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
//                     if (startChallenge) {
//                         const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
//                         console.log(data)
//                         return res.status(200).json({
//                             "code": 200,
//                             "message": "OK",
//                             "data": {
//                                 "challengeName": data.valueFilter,
//                                 "selectChallengeTemplate": data.challengTemplateArray
//                             }
//                         });
//                     }
//                 } else {
//                     return res.status(415).json({
//                         "code": 415,
//                         "message": "현재 진행 중인 챌린지와 중복됩니다.",
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             "code": 500,
//             "message": "Server Error"
//         });
//     }
// };