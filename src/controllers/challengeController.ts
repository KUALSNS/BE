
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { Request, Response } from 'express';
import * as ChallengeService from '../services/challengeService.js';
import { afterMainResponseDto, beforeMainResponseDto, categorySearchRequestDto, challengeSearchResponseDto } from '../interfaces/challengeDTO.js';
import { ErrorResponse, SuccessResponse } from '../modules/returnResponse.js';


/**
 * 로그인 이전 메인 화면 함수
 * @param req 
 * @param res  
 * @param next 
 * @returns  1. 카테고리와 챌린지 데이터 반환
 *           2. 반환 데이터가 없을 시 클라이언트 오류 반환
 *           3. 서버 오류 반환
 */
export const beforeMain = async (req: Request, res: Response<beforeMainResponseDto>) => {
    try {
        const [categoryDB, challengesDB] = await Promise.all([
            ChallengeService.allCategoryData(),
            ChallengeService.allChallengeData()
        ])

        if (!categoryDB || !challengesDB) {
            return new ErrorResponse(400, "값을 찾을 수 없습니다.").sendResponse(res);
        }

        const category = categoryDB.map((e) => {
            return e.name
        });
        const challenges = challengesDB.map((e) => ({
            ...e,
            title: e.title,
            category: e.category.name,
            image: e.category.emogi
        }));
        return new SuccessResponse(200, "OK", { category, challenges }).sendResponse(res)
    } catch (error) {
        console.error(error);
        return new ErrorResponse(500, "Server Error").sendResponse(res);
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
export const challengeSearch = async (req: Request<any, any, any, categorySearchRequestDto>, res: Response<challengeSearchResponseDto>) => {
    try {

        const categorySearch = req.query.categorySearch;
        const SearchWord = categorySearch.replace(/ /g, "");
        const data = await ChallengeService.challengeSearchData(SearchWord);

        if (data != undefined) {
            const challenges = data.map((item) => ({
                ...item,
                category: item.category.name
            }));

            return new SuccessResponse(200, "OK", challenges).sendResponse(res);
        }
        return new ErrorResponse(400, "값을 찾을 수 없습니다.").sendResponse(res);
    } catch (error) {
        console.error(error);
        return new ErrorResponse(500, "Server Error").sendResponse(res);
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
export const afterMain = async (req: Request, res: Response<afterMainResponseDto>) => {
    try {

        const user_id : number = req.decoded?.id;

        const [categoryDB, challengesDB, userDB, userChallengingDB] = await Promise.all([
            ChallengeService.allCategoryData(),
            ChallengeService.allChallengeData(),
            ChallengeService.userCooponAndNicknameAndIdentifierData(user_id),
            ChallengeService.userChallengingData(user_id)

        ])

        const nickname = userDB[0].nickname;
        const coopen = userDB[0].coopon;
        const identifier = userDB[0].identifier;

        

        const userChallengeArray = userChallengingDB.map((e) => ({
            challenges: e.challenges.title,
            achievement: Math.round(e.user_challenge_templetes.length * 3.3)
        }));

        const category = categoryDB.map((e) => e.name);
        const challengesArray = challengesDB.map((e) => ({
            ...e,
            title: e.title,
            category: e.category.name,
            image: e.category.emogi
        }));
        let challengeCertain: boolean;
        const userChallengeSu = userChallengeArray.length;

        if (userChallengeSu == 0) {
            challengeCertain = false;
        } else {
            challengeCertain = true;
        }
        return new SuccessResponse(200, "OK",{ 
            nickname,
            coopen,
            identifier,
            challengeCertain,
            userChallengeSu,
            userChallengeArray,
            category,
            challengesArray}).sendResponse(res);

    } catch (error) {
        console.error(error);
        return new ErrorResponse(500,"Server Error").sendResponse(res);
    }
};
