import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import { checkIdentifierRequestDto, checkIdentifierResponseDto, decoded, kakaoLogInResponseDto, passwordUpdate, redisCode, refreshResultDB, UserIdResponseDto, userIdFindRequestDto, userIdentifierDB, userLoginRequestDto, UserLoginResponseDto, userPasswordFindRequestDto, userSignupDto, UserReissueTokenResponseDto } from '../interfaces/userDTO';
import *  as UserService from '../services/userService';
import bcrypt from 'bcrypt';
import * as jwt from '../modules/jwtModules';
import * as redis from 'redis';
import { serviceReturnForm } from '../modules/responseHandler';
import { smtpSender, randomPasswordsmtpSender } from '../modules/mailHandler';
import { RowDataPacket } from 'mysql2/promise';
import { randomPasswordFunction } from '../modules/randomPassword';
import axios from 'axios';
import { ErrorResponse, SuccessResponse } from '../modules/returnResponse';
declare var process: {
    env: {
        SALTROUNDS: string
        REDIS_USERNAME: string
        REDIS_PASSWORD: string
        REDIS_HOST: string
        REDIS_PORT: number
    }
}

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true
});


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
            await redisClient.disconnect();
            return res.status(200).send({ status: 200, message: "Success Verify Email" });
        } else {
            await redisClient.disconnect();
            return res.status(400).send({ status: 400, message: "Fail Verify Email" });
        }
    } catch (error) {
        await redisClient.disconnect();
        return res.status(500).send({ status: 500, message: "Fail Verify Email" });
    }

}


/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */
//회원 가입용 이메일 코드 요청
export async function sendEmail(req: Request, res: Response) {
    try {
        const emailToSend = req.body.email;
        console.log(emailToSend);

        const returnData: serviceReturnForm = await smtpSender(
            emailToSend
        );
        if (returnData.status == 200) {
            // when successed
            const { status, message, responseData } = returnData;
            res.status(status).send({
                status,
                message,
                responseData,
            });
        } else {
            // when failed
            const { status, message } = returnData;
            res.status(status).send({
                status,
                message,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Fail Send Email" });
    }


}



/**
 * @route Method /Route
 * @desc Function Description
 * @access Public
 */

export const userSignup = async (req: Request, res: Response) => {

    // * Validate user input
    if (!req.body.email || !req.body.password || !req.body.nickname || !req.body.userId) {
        res.status(400).send({ status: 400, message: "Fail SignUp" });
        return;
    }
    const { email, password, nickname, userId, phoneNumber } = req.body;

    const returnData: serviceReturnForm = await UserService.userSignup(
        email,
        password,
        nickname,
        userId,
        phoneNumber
    );
    if (returnData.status == 200) {
        // when successed
        const { status, message, responseData } = returnData;
        res.status(status).send({
            status,
            message,
            responseData,
        });
    } else {
        // when failed
        const { status, message } = returnData;
        res.status(status).send({
            status,
            message,
        });
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

        const { userIdentifier, userPassword } = req.body;
        const data = await UserService.userIdentifierSign(userIdentifier);

        if (data == null || data == undefined) {
            return new ErrorResponse(404, "Id can't find").sendResponse(res);
        }
        const comparePassword = await bcrypt.compare(userPassword, data.password);
        if (!comparePassword) {
            return new ErrorResponse(419, "Password can't find").sendResponse(res);
        }
        const accessToken = "Bearer " + jwt.sign(data.user_id, data.role);
        const refreshToken = "Bearer " + jwt.refresh();

        await redisClient.connect();
        await redisClient.v4.set(String(data.user_id), refreshToken);
        await redisClient.disconnect();


        return new SuccessResponse(200, "OK", {
            accessToken,
            refreshToken,
            role: data.role
        }).sendResponse(res);

    } catch (error) {
        console.error(error);
        await redisClient.disconnect();
        return new ErrorResponse(500, "Server Error").sendResponse(res);
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
        await redisClient.connect();
        const requestAccessToken = req.headers.access;
        const requestRefreshToken = req.headers.refresh;

        if (requestAccessToken !== undefined && requestRefreshToken !== undefined && typeof requestAccessToken == 'string' && typeof requestRefreshToken == 'string') {

            const accessToken = requestAccessToken.split('Bearer ')[1];
            const refreshToken = requestRefreshToken.split('Bearer ')[1];

            const authResult = jwt.verify(accessToken);
            const decoded = jwt.decode(accessToken);

            await redisClient.disconnect();

            const refreshResult = await jwt.refreshVerify(refreshToken, decoded?.id);

            await redisClient.connect();
            if (authResult.state === false) {

                if (refreshResult?.state === false) {
                    console.log(decoded!.id);
                    await redisClient.disconnect();
                    return new ErrorResponse(419, "login again!").sendResponse(res)
                }

                const newAccessToken = jwt.sign(String(decoded?.id), decoded?.role);
                const userRefreshToken = await redisClient.v4.get(String(decoded?.id));
                await redisClient.disconnect();
                return new SuccessResponse(200, "OK", {
                    accessToken: "Bearer " + newAccessToken,
                    refreshToken: userRefreshToken
                }).sendResponse(res);
            }
            await redisClient.disconnect();
            return new ErrorResponse(400, "access token is not expired!").sendResponse(res)
        }

        await redisClient.disconnect();
        return new ErrorResponse(402, "헤더의 값을 알 수 없습니다.").sendResponse(res);

    } catch (error) {
        console.error(error);
        await redisClient.disconnect();
        return new ErrorResponse(500, "Server Error").sendResponse(res);

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
        await redisClient.connect();
        if (typeof req.headers.access == "string") {
            const accessToken = req.headers.access.split('Bearer ')[1];
            const decode = jwt.decode(accessToken);
            if (decode === null) {
                await redisClient.disconnect();
                return res.status(404).send({
                    code: 404,
                    message: 'No content.',
                });
            }
            await redisClient.v4.del(String(decode!.id));
            await redisClient.disconnect();
            return res.status(200).send({
                code: 200,
                message: "Logout success"
            });
        }
        else {
            await redisClient.disconnect();
            return res.status(403).json({
                "code": 403,
                "message": "strange state"
            });
        }
    } catch (error) {
        await redisClient.disconnect();
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
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

            const data = await UserService.userId(email);

            if (data[0] == undefined) {
                return new ErrorResponse(404,"email can't find").sendResponse(res);
            }

            await redisClient.disconnect();
    
            return new SuccessResponse(200,"OK",{
                userId: data[0].identifier
            }).sendResponse(res);
        }

        await redisClient.disconnect();
        return new ErrorResponse(400,"Fail Verify Email").sendResponse(res);

    } catch (error) {
        await redisClient.disconnect();
        return new ErrorResponse(500,"Server Error").sendResponse(res);
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
        const userIdSignData: userIdentifierDB[] | false = await UserService.userIdentifier(identifier);

        if (userIdSignData) {
            if (userIdSignData[0] == null || userIdSignData[0] == undefined) {
                return res.status(404).json({
                    code: 404,
                    message: "Id can't find"
                });
            }
            const randomPassword = randomPasswordFunction();
            const encryptedPassword = await bcrypt.hash(randomPassword, 10);
            const passwordUpdate: passwordUpdate | false = await UserService.updatePassword(identifier, userEmail, encryptedPassword, randomPassword);

            if (passwordUpdate) {
                if (typeof passwordUpdate !== 'undefined') {
                    await randomPasswordsmtpSender(
                        userEmail,
                        passwordUpdate
                    );
                    return res.status(200).json({
                        message: "OK",
                        code: 200
                    });
                }

            } else {
                return res.status(502).json({
                    code: 502,
                    message: "DB Server Error"
                });
            }
        } else {
            return res.status(502).json({
                code: 502,
                message: "DB Server Error"
            });

        }

    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
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
export const checkIdentifier = async (req: Request<any, any, any, checkIdentifierRequestDto>, res: Response<checkIdentifierResponseDto>) => {
    try {

        const checkIdentifier = req.query.checkIdentifier;
        const identifierData = await UserService.selectIdentifier(checkIdentifier);

        if (identifierData == null) {

            return res.status(200).json({
                message: "아이디 사용 가능",
                code: 200
            });

        }
        return res.status(400).json({
            message: "아이디 중복",
            code: 400
        });

    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
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

        const kakaoAccessToken = req.headers.access;

        if (kakaoAccessToken !== undefined && typeof kakaoAccessToken == 'string') {
            const userData = await axios({
                method: 'get',
                url: 'https://kapi.kakao.com/v2/user/me',
                headers: {
                    Authorization: `Bearer ${kakaoAccessToken}`
                }
            });

            const userEmail = userData.data.kakao_account.email;
            const userNickname = userData.data.properties.nickname;
            const userCheck = await UserService.selectIdentifier(userEmail);


            if (userCheck == null) {
                await UserService.kakaoSignUp(userEmail, userNickname);
            }

            const userId = await UserService.selectIdentifier(userEmail);


            if (userId) {
                const accessToken = "Bearer " + jwt.sign(String(userId.user_id), userId.role);
                const refreshToken = "Bearer " + jwt.refresh();

                await redisClient.connect();
                await redisClient.v4.set(String(userId.user_id), refreshToken);
                await redisClient.disconnect();

                return res.status(200).json({
                    code: 200,
                    message: "Ok",
                    data: {
                        accessToken,
                        refreshToken
                    },
                    role: userId.role
                });
            }
        }
    } catch (error) {
        await redisClient.disconnect();
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
    }
};













