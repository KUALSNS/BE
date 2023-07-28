import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express'
const secret = process.env.JSONSECRET!;

const verifyToken = (req : any, res : Response, next : NextFunction) => {
  try {
    const token : string = req.header("access") as string;
    const organized_token = token.substr(7);
    req.decoded = jwt.verify(organized_token,secret);
    return next();
  } catch (error : any) {
    if (error.name === 'TokenExpiredError') { // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다',
    });
  }
}





export { verifyToken } 