import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import { checkIdentifierRequestDto, kakaoLogInResponseDto, passwordUpdate, redisCode, UserIdResponseDto, userIdFindRequestDto, userLoginRequestDto, UserLoginResponseDto, userPasswordFindRequestDto, userSignupDto, UserReissueTokenResponseDto, signUpRequestDto, sendEmailRequestDto, sendEmailReponseDto } from '../interfaces/userDTO';
import *  as UserService from '../services/userService.js';
import bcrypt from 'bcrypt';
import * as jwt from '../modules/jwtModules.js';
import { serviceReturnForm } from '../modules/responseHandler.js';
import { smtpSender, randomPasswordsmtpSender } from '../modules/mailHandler.js';
import axios from 'axios';
import { RowDataPacket } from 'mysql2/promise';
import { randomPasswordFunction } from '../modules/randomPassword.js';
import { ErrorResponse, SuccessResponse } from '../modules/returnResponse.js';
import { stream, logger } from '../modules/loggerHandler.js';
import { redisClient } from '../config/redis.js';


/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.query;
        await redisClient.connect();
        const redisCode = await redisClient.v4.get(email);
        if (redisCode == parseInt(<string>code)) {
            //       await redisClient.disconnect();
            return res.status(200).send({ status: 200, message: "Success Verify Email" });
        } else {
            //     await redisClient.disconnect();
            return res.status(400).send({ status: 400, message: "Fail Verify Email" });
        }
    } catch (error) {
        //     await redisClient.disconnect();
        if (error instanceof Error) {
            logger.error(error.stack);
            return res.status(500).send({ status: 500, message: "Fail Verify Email" });
        }
    } finally {
        await redisClient.disconnect(); // 연결 종료
    }


}


/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
//회원 가입용 이메일 코드 요청
export const sendEmail = async (req: Request<any, any, sendEmailRequestDto>, res: Response<sendEmailReponseDto>) => {
    try {
        const emailToSend = req.body.email;

        const userIdDB = await UserService.userIdentifierData(emailToSend);

        if (!(userIdDB[0] === undefined)) {
            return new ErrorResponse(400, "메일이 중복됩니다.").sendResponse(res);
        }


        const returnData: serviceReturnForm = await smtpSender(
            emailToSend
        );
        if (returnData.status == 200) {

            const { status, message, responseData } = returnData;
            return new SuccessResponse(200, "OK", {
                status,
                message,
                responseData,
            }).sendResponse(res);
        } else {
            return new ErrorResponse(502, "메일 인증 실패").sendResponse(res);
        }

    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    }
}


/**
 * 
 * @param req 이메일, 비밀번호, 닉네임, 아이디, 핸드폰 번호
 * @param res  1. 완료(200)
 *             2. 서버오류(500)
 * @returns 
 */
export const userSignup = async (req: Request<any, any, signUpRequestDto>, res: Response) => {
    try {

        const { email, password, nickname, identifier, phoneNumber } = req.body;

        const encryptedPassword = await bcrypt.hash(password, 10);

        await UserService.userSignupData(
            email,
            encryptedPassword,
            nickname,
            identifier,
            phoneNumber
        );
        return new SuccessResponse(200, "OK").sendResponse(res);

    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    }
};







/**
 * 유저 로그인 함수
 * @param req 유저 아이디, 유저 비밀번호 받기
 * @param res 
 * @param next 
 * @returns 1. 404 유저 아이디, 비밀번호 옳지 않음
 *          2. 200 accessToken, refreshToken 발급
 *          3. 서버 오류
 */
export const userLogin = async (req: Request<any, any, userLoginRequestDto>, res: Response<UserLoginResponseDto>) => {
    try {

     //   await redisClient.connect();

        const { userIdentifier, userPassword } = req.body;
        const data = await UserService.userInformationSelectData(userIdentifier);

        if (data == null || data == undefined) {
            return new ErrorResponse(404, "Id can't find").sendResponse(res);
        }
        const comparePassword = await bcrypt.compare(userPassword, data.password);
        if (!comparePassword) {
            return new ErrorResponse(419, "Password can't find").sendResponse(res);
        }
        const accessToken = "Bearer " + jwt.sign(data.user_id, data.role);
        const refreshToken = "Bearer " + jwt.refresh();


        await redisClient.v4.set(String(data.user_id), refreshToken);
        //       await redisClient.disconnect();


        return new SuccessResponse(200, "OK", {
            accessToken,
            refreshToken,
            role: data.role
        }).sendResponse(res);

    } catch (error) {
        //     await redisClient.disconnect();
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    } finally {
     //        await redisClient.disconnect(); // 연결 종료

    }
};
/**
 * 유저 토큰 재발급 함수
 * @param req  header로부터 accessToken, refreshToken 모두 받거나 accessToken 하나만 받는다.
 * @param res  
 * @param next 
 * @returns  1. 재로그인 요청
 *           2.  accessToken 토큰 만료
 *           3. accessToken, refreshToken 재발급
 *           4. 서버 오류
 */
export const userReissueToken = async (req: Request, res: Response<UserReissueTokenResponseDto>) => {
    try {

       
      //      await redisClient.connect();

        const requestAccessToken = req.headers.access;
        const requestRefreshToken = req.headers.refresh;


        if (requestAccessToken !== undefined && requestRefreshToken !== undefined && typeof requestAccessToken == 'string' && typeof requestRefreshToken == 'string') {


            const accessToken = requestAccessToken.split('Bearer ')[1];
            const refreshToken = requestRefreshToken.split('Bearer ')[1];

            const authResult = jwt.verify(accessToken);
            const decoded = jwt.decode(accessToken);

            const refreshResult = await jwt.refreshVerify(refreshToken, decoded?.id);

            if (authResult.state === false) {

                console.log("after2")

                if (refreshResult?.state === false) {
                    console.log("after3")

                    return new ErrorResponse(419, "login again!").sendResponse(res)
                }


                const newAccessToken = jwt.sign(decoded?.id, decoded?.role);
                //     await redisClient.connect();

                const userRefreshToken = await redisClient.v4.get(String(decoded?.id));

                //      await redisClient.disconnect();
                return new SuccessResponse(200, "OK", {
                    accessToken: "Bearer " + newAccessToken,
                    refreshToken: userRefreshToken
                }).sendResponse(res);
            }

            return new ErrorResponse(400, "access token is not expired!").sendResponse(res)
        }

        return new ErrorResponse(402, "헤더의 값을 알 수 없습니다.").sendResponse(res);

    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    } finally {
    //    await redisClient.disconnect(); // 연결 종료

    }
};


/**
 * 
 * @param req  header로 accessToken을 받아옴
 * @param res 
 * @param next 
 * @returns  
 *  1. 로그아웃 완료
 *  2. accessToken 오류
 */
export const userLogout = async (req: Request, res: Response) => {
    try {
     
     //      await redisClient.connect();
     
        if (typeof req.headers.access == "string") {
            const accessToken = req.headers.access.split('Bearer ')[1];
            const decode = jwt.decode(accessToken);
            if (decode === null) {
                //     await redisClient.disconnect();
                return res.status(404).send({
                    code: 404,
                    message: 'No content.',
                });
            }
            await redisClient.v4.del(String(decode!.id));
            //     await redisClient.disconnect();
            return res.status(200).send({
                code: 200,
                message: "Logout success"
            });
        }
        else {
            //      await redisClient.disconnect();
            return res.status(403).json({
                "code": 403,
                "message": "strange state"
            });
        }
    } catch (error) {
        //    await redisClient.disconnect();
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    } finally {
     //   await redisClient.disconnect(); // 연결 종료
    }
};

/**
 * 아이디 찾기 함수
 * @param req  email, 인증 코드
 * @param res 
 * @param next 
 * @returns 1. 아이디를 찾을 수 없을 경우(404)
 *          2. 해당 유저의 아이디 반환(200)
 *          3. service 함수 에러 (502)
 *          4. 메일 인증 실패 (400)
 *          5. 서버 에러(500)
 */
export const userIdFind = async (req: Request<any, any, any, userIdFindRequestDto>, res: Response<UserIdResponseDto>) => {
    try {
        const email = req.query.email;
        const code = req.query.code;

        await redisClient.connect();
        const redisCode: redisCode = await redisClient.v4.get(email);

        if (redisCode == parseInt(<string>code)) {

            const data = await UserService.userIdentifierData(email);

            if (data[0] == undefined) {
                return new ErrorResponse(404, "email can't find").sendResponse(res);
            }

            //        await redisClient.disconnect();

            return new SuccessResponse(200, "OK", {
                userId: data[0].identifier
            }).sendResponse(res);
        }

        //   await redisClient.disconnect();
        return new ErrorResponse(400, "Fail Verify Email").sendResponse(res);

    } catch (error) {
        //  await redisClient.disconnect();
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    } finally {
                await redisClient.disconnect(); // 연결 종료
    }
};

/**
 * 비밀번호 변경 함수
 * @param req  유저 아이디, 이메일
 * @param res 
 * @param next 
 * @returns 1. 확인 코드(200)
 *          2. id를 찾을 수 없음 (404)\
 *          3. service 함수 에러 (502)
 *          4. 서버 에러 (500)
 */
export const userPasswordFind = async (req: Request<any, any, userPasswordFindRequestDto>, res: Response) => {
    try {

        const { identifier, userEmail } = req.body;
        const userIdSignData = await UserService.userInformationSelectData(identifier);

        if (userIdSignData?.user_id == null || userIdSignData?.user_id == undefined) {

            return new ErrorResponse(404, "Id can't find").sendResponse(res);

        }
        if (userEmail !== userIdSignData.email) {
            return new ErrorResponse(405, "이메일이 옳바르지 않습니다.").sendResponse(res);

        }

        const randomPassword = randomPasswordFunction();
        const encryptedPassword = await bcrypt.hash(randomPassword, 10)
        await UserService.updatePasswordData(identifier, userEmail, encryptedPassword);

        randomPasswordsmtpSender(
            userEmail,
            randomPassword
        );

        return new SuccessResponse(200, "OK").sendResponse(res);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    }
};

/**
 * 
 * @param req 유저 아이디
 * @param res 중복 확인 결과
 * @returns 
 *          1. 서버 오류
 *          2. 아이디 사용 가능
 *          3. 아이디 중복
 */
export const checkIdentifier = async (req: Request<any, any, any, checkIdentifierRequestDto>, res: Response) => {
    try {

        const checkIdentifier = req.query.checkIdentifier;
        const identifierData = await UserService.userInformationSelectData(checkIdentifier);

        if (identifierData == null) {

            return new SuccessResponse(200, "아이디 사용 가능").sendResponse(res);

        }
        return new ErrorResponse(400, "아이디 중복").sendResponse(res);

    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    }
};

/**
 * 
 * @param req 카카오 accessToken
 * @param res access, refresh 토큰
 * @returns 1. 서버 오류
 *          2. 정상 반응
 */
export const kakaoLogIn = async (req: Request, res: Response<kakaoLogInResponseDto>) => {
    try {


     //   await redisClient.connect();

        const kakaoAccessToken = req.headers.access;

        const userData = await axios({
            method: 'get',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                Authorization: `Bearer ${kakaoAccessToken}`
            }
        });

        const userEmail = userData.data.kakao_account.email;
        const userNickname = userData.data.properties.nickname;
        const userCheck = await UserService.userInformationSelectData(userEmail);

        if (userCheck == null) {
            await UserService.kakaoSignUpData(userEmail, userNickname);
        }

        const userId = await UserService.userInformationSelectData(userEmail);

        const accessToken = "Bearer " + jwt.sign(userId?.user_id, userId!.role);
        const refreshToken = "Bearer " + jwt.refresh();


        await redisClient.v4.set(String(userId?.user_id), refreshToken);
        //     await redisClient.disconnect();


        return new SuccessResponse(200, "OK", {
            accessToken,
            refreshToken,
            role: userId?.role
        }).sendResponse(res);

    } catch (error) {
        //      await redisClient.disconnect();
        if (error instanceof Error) {
            logger.error(error.stack);
            return new ErrorResponse(500, "Server Error").sendResponse(res);
        }
    } finally {
     //   await redisClient.disconnect(); // 연결 종료
    }
};













