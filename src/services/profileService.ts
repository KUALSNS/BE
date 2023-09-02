import { serviceReturnForm } from '../modules/responseHandler.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

const getProfile = async (userId: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    try {
        console.log("here is find unique before")

        const data = await prisma.users.findUnique({ where: { user_id: userId } });
        console.log(data)
        if (data) {
            returnForm.status = 200;
            returnForm.message = "Success";
            // delete password from data without ts error
            //delete data.password;
            data.password = "";
            returnForm.responseData = data;
        } else {
            returnForm.status = 400;
            returnForm.message = "User Not Found";
        }
    } catch (e: any) {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on get profile process";
    }
    return returnForm;
}

const couponActivation = async (userId: number, couponActivation: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    try {
        const data = await prisma.users.update({
            where: {
                user_id: userId
            },
            data: {
                coopon: couponActivation
            }
        });
        if (data) {
            returnForm.status = 200;
            returnForm.message = "Success";
        } else {
            returnForm.status = 400;
            returnForm.message = "User Not Found";
        }
    } catch (e: any) {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on coupon activation process";
    }
    return returnForm;
}


const getChallengeStatistics = async (year: string, month: string, week: string, period:string, userId: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    try {
        let data: any;
        const summary = {
            participants: 0,
            challengesInProgress: 0,
            daysNotCompleted: 0,
        };
        if (period == "week") {

            // Count the number of distinct participants
            const distinctParticipants = await prisma.user_challenges.aggregate({
                _count: {
                    user_id: true,
                },
            });
            summary.participants = distinctParticipants._count.user_id;

            // Count the number of challenges in progress
            summary.challengesInProgress = await prisma.user_challenges.count({

            });

            // Count the number of days that have not been completed
            summary.daysNotCompleted = await prisma.user_challenge_templetes.count({
                where: { complete: false },
            });
        } else {
            returnForm.status = 400;
            returnForm.message = "Invalid period";
            return returnForm;
        }
        data = summary;
        console.log(data);
        if (data) {
            returnForm.status = 200;
            returnForm.message = "Success";
            returnForm.responseData = data;
        } else {
            returnForm.status = 400;
            returnForm.message = "User Not Found";
        }
    } catch (e: any) {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on get challenge statistics process";
    }
    return returnForm;
}


const updateEmail = async (email: string, user_id: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };

    await prisma.users.update({
        where: { user_id: user_id },
        data: {
        email: email
        }
    })
        .then((data: Object) => {
        if (data) {
            returnForm.status = 200;
            returnForm.message = "Success";
        } else {
            returnForm.status = 400;
            returnForm.message = "User Not Found";
        }
        })
        .catch((e: any) => {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on update email process";
        });
    return returnForm;
}

const updatePassword = async (oldPassword: string, newPassword: string, user_id: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    await prisma.users.findUnique({
        where: { user_id: user_id }
    })
        .then(async (data : any) => {
        if (data) {
            const compare = await bcrypt.compare(oldPassword, data.password);

            if (compare) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.users.update({
                where: { user_id: user_id },
                data: {
                password: hashedPassword
                }
            })
                .then((data: Object) => {
                if (data) {
                    returnForm.status = 200;
                    returnForm.message = "Success";
                } else {
                    returnForm.status = 400;
                    returnForm.message = "User Not Found";
                }
                })
                .catch((e: any) => {
                console.log(e);
                returnForm.status = 500;
                returnForm.message = "Server Error on update password process";
                });
            } else {
            returnForm.status = 401;
            returnForm.message = "Wrong Password";
            }
        } else {
            returnForm.status = 404;
            returnForm.message = "User Not Found";
        }
        })
        .catch((e: any) => {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on update password process";
        });
    return returnForm;
}


const updateProfile = async (nickname: string, phoneNumber: string,marketingAgreement:number, user_id: number) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.update({
    where: { user_id: user_id },
    data: {
      nickname: nickname,
      phone: phoneNumber,
      mar_email: marketingAgreement
    }
  })
    .then((data: Object) => {
      if (data) {
        returnForm.status = 200;
        returnForm.message = "Success";
        //delete password from data
        returnForm.responseData = data
      } else {
        returnForm.status = 400;
        returnForm.message = "User Not Found";
      }
    })
    .catch((e: any) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on update profile process";
    });
  return returnForm;
}

export  { getProfile, updateProfile,updatePassword, updateEmail, getChallengeStatistics, couponActivation}