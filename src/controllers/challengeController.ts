
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/challengeService';
import { afterMainDTO, beforeMainDto, categorySearchRequestDto, challengeSearchDto } from '../interfaces/challengeDTO';

/**
 * 로그인 이전 메인 화면 함수
 * @param req 
 * @param res  
 * @param next 
 * @returns  1. 카테고리와 챌린지 데이터 반환
 *           2. 반환 데이터가 없을 시 클라이언트 오류 반환
 *           3. 서버 오류 반환
 */
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

/**
 * 메인 화면에서의 카테고리 검색 함수
 * @param req  검색할  카테고리
 * @param res 
 * @param next 
 * @returns  1. 검색 결과 반환
 *           2. 검색 결과가 없을 시 클라이언트 오류 반환
 *           3. 서버 오류 반환
 */
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

/**
 * 로그인 후 메인 화면 함수
 * @param req 미들웨어를 통한 유저 id
 * @param res 
 * @param next 
 * @returns  1.  카테고리, 챌린지 데이터, 유저의 챌린지 개수, 챌린지별 달성률, 쿠폰 사용 유무 반환
 *           2. 반환 데이터가 없을 시 클라이언트 오류 반환
 *           3. 서버 오류 반환
 */
export const afterMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const user_id = req.decoded?.id;
        const data : afterMainDTO | undefined | false = await ChallengeController.afterMainData(user_id);
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
