import { NextFunction, Request, Response } from 'express';
import { userLoginDto } from '../interfaces/DTO';
import *  as UserService from '../services/userService';
import bcrypt from 'bcrypt';
import * as jwt from '../middleware/auth';
import * as redis from 'redis';


const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true
});


export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await redisClient.connect();
        const { userEmail, userPassword }: userLoginDto = req.body;
        const userEmailSelect = await UserService.userEmailSelect(userEmail);
        console.log(userEmailSelect);
        if (userEmailSelect == null || userEmailSelect == undefined) {
            return res.status(404).json({
                code: 404,
                message: "Id can't find"
            });
        }
        const comparePassword = await bcrypt.compare(userPassword, userEmailSelect.password);
        if (!comparePassword) {
            return res.status(404).json({
                code: 404,
                message: "Password can't find"
            });
        }
        const accessToken = "Bearer " + jwt.sign(userEmailSelect.id, userEmailSelect.role);
        const refreshToken = "Bearer " + jwt.refresh();
        await redisClient.v4.set(String(userEmailSelect.id), refreshToken);
        if (userEmailSelect === 1) {
            return res.status(200).json({
                code: 200,
                message: "Ok",
                data: {
                    accessToken,
                    refreshToken
                },
                role: 1
            });
        } else {
            return res.status(200).json({
                code: 200,
                message: "Ok",
                data: {
                    accessToken,
                    refreshToken
                },
                role: 0
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    } finally {
        await redisClient.disconnect();   
    }
};

/**
 * 
 * @param req  header로부터 accessToken, refreshToken 모두 받거나 accessToken 하나만 받는다.
 * @param res  
 * @param next 
 * @returns 
 * 1. accessToken, refreshToken 둘 다 넘어왔을 경우
 *      => accessToken, refreshToken 둘 다 만료 시 재로그인 응답
 *      => accessToken만 만료 시 새로운 accessToken과 기존 refrshToken 응답
 * 2. accessToken만 넘어왔을 경우(자동 로그인) 
 *      => accessToken을 확인 후 만료가 안됐다면 자동로그인 가능 응답
 */
export const userReissueToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
            await redisClient.connect();
            const accessToken = (req.headers.access as string).split('Bearer ')[1];
            const authResult = jwt.verify(accessToken);
            const decoded = jwt.decode(accessToken);
            if (req.headers.access && req.headers.refresh) {
                const refreshToken = (req.headers.refresh as string).split('Bearer ')[1];
                console.log(refreshToken);
                if (decoded === null) {
                    return res.status(404).json({
                        code: 404,
                        message: 'No content.',
                    });
                }
                const refreshResult = await jwt.refreshVerify(refreshToken, decoded.id);
                if (authResult.state === false) {
                    if (typeof refreshResult != 'undefined') {
                        if (refreshResult.state === false) {
                            return res.status(419).json({
                                code: 419,
                                message: 'login again!',
                            });              
                        }                   
                        else {
                            const newAccessToken = jwt.sign(decoded.id, decoded.role);
                            const userRefreshToken = await redisClient.v4.get(String(decoded.id));
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
                    return res.status(400).json({
                        code: 400,
                        message: 'access token is not expired!',
                    });
                }
            }
            else if (req.headers.access) {
                if (authResult.state === false) {
                    return res.status(419).json({
                        code: 419,
                        message: 'accesToken expired',
                    });
                }
                return res.status(203).json({
                    code: 203,
                    message: 'u can do automatic login.',
                });
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: "Server Error"
        });
    }finally{
        await redisClient.disconnect();
    }
};





export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {





    } catch (error) {

    }
};