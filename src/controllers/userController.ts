require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import { userLoginDto, userSignupDto } from '../interfaces/DTO';
import *  as UserService from '../services/userService';
import bcrypt from 'bcrypt';
import * as jwt from '../middleware/auth';
import * as redis from 'redis';
import { serviceReturnForm } from '../modules/responseHandler';
import { smtpSender } from '../modules/mailHandler';
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
 * 
 * @param req 유저 이메일, 유저 비밀번호 받기
 * @param res 
 * @param next 
 * @returns 1. 404 유저 아이디, 비밀번호 옳지 않음
 *          2. 200 accessToken, refreshToken 발급
 */
export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userIdentifier, userPassword }: userLoginDto = req.body;
        const userIdentifierSelect = await UserService.userIdentifierSelect(userIdentifier);
        if (userIdentifierSelect == null || userIdentifierSelect == undefined) {
            return res.status(404).json({
                code: 404,
                message: "Id can't find"
            });
        }
        const comparePassword = await bcrypt.compare(userPassword, userIdentifierSelect.password);
        if (!comparePassword) {
            return res.status(419).json({
                code: 419,
                message: "Password can't find"
            });
        }
        const accessToken = "Bearer " + jwt.sign(userIdentifierSelect.user_id, userIdentifierSelect.role);
        const refreshToken = "Bearer " + jwt.refresh();
        await redisClient.connect();
        await redisClient.v4.set(String(userIdentifierSelect.user_id), refreshToken);
        await redisClient.disconnect();
        return res.status(200).json({
            code: 200,
            message: "Ok",
            data: {
                accessToken,
                refreshToken
            },
            role: userIdentifierSelect.role
        });

    } catch (error) {
        console.error(error);
        await redisClient.disconnect();
        return res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    }
};
/**
 * 
 * @param req  header로부터 accessToken, refreshToken 모두 받거나 accessToken 하나만 받는다.
 * @param res  
 * @param next 
 * @returns 
 *      => accessToken, refreshToken 둘 다 만료 시 재로그인 응답
 *      => accessToken만 만료 시 새로운 accessToken과 기존 refrshToken 응답
 */
export const userReissueToken = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const accessToken = (req.headers.access as string).split('Bearer ')[1];
        const authResult = jwt.verify(accessToken);
        const decoded = jwt.decode(accessToken);
        console.log(decoded)
        if (req.headers.access && req.headers.refresh) {
            const refreshToken = (req.headers.refresh as string).split('Bearer ')[1];
            try {
                var refreshResult = await jwt.refreshVerify(refreshToken, decoded!.id);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    code: 500,
                    message: "Server Error"
                });

            }
            await redisClient.connect();
            if (authResult.state === false) {
                if (typeof refreshResult != 'undefined') {
                    if (refreshResult.state === false) {
                        console.log(decoded!.id);
                        await redisClient.disconnect();
                        return res.status(419).json({
                            code: 419,
                            message: 'login again!',
                        });
                    }
                    else {
                        const newAccessToken = jwt.sign(decoded!.id, decoded!.role);
                        const userRefreshToken = await redisClient.v4.get(String(decoded!.id));
                        await redisClient.disconnect();
                        return res.status(200).json({
                            code: 200,
                            message: "Ok",
                            data: {
                                accessToken: "Bearer " + newAccessToken,
                                refreshToken: userRefreshToken
                            },
                        });
                    }
                }
            }
            else {
                await redisClient.disconnect();
                return res.status(400).json({
                    code: 400,
                    message: 'access token is not expired!',
                });
            }
        }
    } catch (error) {
        console.error(error);
        await redisClient.disconnect();
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
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
export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
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
