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
redisClient.connect();


export const userLogin = async (req : Request, res : Response, next : NextFunction) => {
    try{     
        
        const { userEmail, userPassword } : userLoginDto = req.body; 
        const userEmailSelect =  await UserService.userEmailSelect(userEmail);
        console.log(userEmailSelect);
        if(userEmailSelect == null || userEmailSelect == undefined ){
            return res.status(404).json({ 
                code:404, 
                message: "Id can't find"
            });
        }
      
        const comparePassword = await bcrypt.compare(userPassword, userEmailSelect.password);
        if(!comparePassword){
            return res.status(404).json({code:404, message: "Password can't find"});
        }
        const accessToken = "Bearer " + jwt.sign(userEmailSelect.id, userEmailSelect.role);
        const refreshToken = "Bearer " + jwt.refresh();  
        await redisClient.set(String(userEmailSelect.id), refreshToken);    
        if(userEmailSelect === 1){
            return res.status(200).json({
                code : 200,
                message : "Ok",
                data : {
                    accessToken,
                    refreshToken
                },
                role : 1
            });
        }else{
            return res.status(200).json({
                code : 200,
                message : "Ok",
                data : {
                    accessToken,
                    refreshToken
                },
                role : 0
        });
    }  
    
    }catch(error){
        console.error(error);
        res.status(500).json({ "code": 500});
    }finally{
        //await redisClient.disconnect();   
    }
};

export const userReissueToken = async (req : Request, res : Response, next : NextFunction) => {
    try{
        




    }catch(error){

    }
};


export const userLogout = async (req : Request, res : Response, next : NextFunction) => {
    try{
        




    }catch(error){

    }
};