
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/challengeService';
import { beforeMainDTO, categorySearchRequestDTO, challengeSearchDTO } from '../interfaces/challengeDTO';


export const beforeMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data : beforeMainDTO | undefined = await ChallengeController.beforeMainData();

        if(data != undefined){
            const category = data.categoryDB.map((e) => {
                return e.name
              });
            const challenges = data.challengesDB.map((e) => ({
                ...e,
                title : e.title,
                category : e.category.name,
                image : e.category.emogi
            }));

            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                category,
                challenges
            });
        }else{
            return res.status(400).json({
                "code": 400,
                "message": "값을 찾을 수 없습니다.",
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


export const challengeSearch = async (req: Request<any, any, any, categorySearchRequestDTO>, res: Response, next: NextFunction) => {
    try {
      
        const categorySearch = req.query.categorySearch;
        const SearchWord = categorySearch.replace(/ /g, "");
        const data : challengeSearchDTO[] | undefined = await ChallengeController.challengeSearchData(SearchWord);
        
        if(data != undefined){
            const challenges = data.map((item) => ({
                ...item,
                category: item.category.name
              }));
            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                challenges
            });
        }else{
            return res.status(400).json({
                "code": 400,
                "message": "값을 찾을 수 없습니다.",
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

export const afterMain = async (req: any, res: Response, next: NextFunction) => {
    try {

        const data = await ChallengeController.afterMainData(req.decoded.id);

        const nickname = data?.nickname;
        const coopen = data?.coopon;
        const userChallengeSu = data?.userChallengeSu;
        const userChallengeArray = data?.userChallengeArray
        const category = data?.category;
        const challengesArray = data?.challengesArray;
        const challengeCertain = data?.challengeCertain;

        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "data": {
                nickname,
                coopen,
                challengeCertain,
                userChallengeSu,
                userChallengeArray,
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
