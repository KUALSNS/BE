require('dotenv').config();
import { NextFunction, Request, Response } from 'express';

export const beforeMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
     
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            "code": 500,
            message: "Server Error"
        });
    } finally {
        
    }
};