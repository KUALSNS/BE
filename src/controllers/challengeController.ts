
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/challengeService';
import { afterMainDTO, beforeMainDto, categorySearchRequestDto, challengeSearchDto } from '../interfaces/challengeDTO';


export const beforeMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data : beforeMainDto | undefined | false = await ChallengeController.beforeMainData();

        if(data){
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
        }else{
            return res.status(500).json({
                "code": 500,
                message: "Server Error"
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


export const challengeSearch = async (req: Request<any, any, any, categorySearchRequestDto>, res: Response, next: NextFunction) => {
    try {
      
        const categorySearch = req.query.categorySearch;
        const SearchWord = categorySearch.replace(/ /g, "");
        const data : challengeSearchDto[] | undefined | false = await ChallengeController.challengeSearchData(SearchWord);

        if(data){
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
        }else{
            return res.status(500).json({
                "code": 500,
                message: "Server Error"
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

        const data : afterMainDTO | undefined | false = await ChallengeController.afterMainData(req.decoded.id);
        if(data){
            if(data !== undefined){
                const nickname = data.userDB[0].nickname;
                const coopen = data.userDB[0].coopon;
                const userChallengeArray = data.userChallengeCountDB.map((e) => ({
                    challenges: e.challenges.title,
                    achievement: Math.round(e.user_challenge_templetes.length * 3.3) 
                }));
                const category = data.categoryDB.map((e) => e.name);
                const challengesArray = data.challengesDB.map((e) => ({
                    ...e,
                    title: e.title,
                    category : e.category.name,
                    image: e.category.emogi
                }));
                let challengeCertain: boolean;
                const userChallengeSu = userChallengeArray.length;
    
                if (userChallengeSu == 0) {
                  challengeCertain = false;
                } else {
                  challengeCertain = true;
                }
            
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
            }else{   
                return res.status(400).json({
                    "code": 400,
                    "message": "값을 찾을 수 없습니다.",
                });    
            }
        }else{
            return res.status(500).json({
                "code": 500,
                "message": "Server Error"
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
