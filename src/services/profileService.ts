import { serviceReturnForm } from '../modules/responseHandler';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const getProfile = async (userId: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    try {
        const data = await prisma.users.findUnique({ where: { user_id: userId } });
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


// user challenge statistics function which returns the number of challenges solved by the user in a month or week
const getChallengeStatistics = async (year: string, month: string, week: string, period:string, userId: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    try {
        let data: any;
        if (period == "week") {
            // user_challenges templates in a week related to the user
            data = await prisma.user_challenge_templetes.findMany({
                where: {
                    AND: [
                        { user_id: { some: { user_id: userId } } },
                        { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                    ],
                }
            }
            );
        } else              if (period == "month") {
            data = await prisma.user_challenge_templetes.findMany({
                where: {
                    AND: [
                        { user_id: { some: { user_id: userId } } },
                        { created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                    ],
                },
            });
        } else {
            returnForm.status = 400;
            returnForm.message = "Invalid period";
            return returnForm;
        }
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


// update email with validation using try catch
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

// password update with hashing using try catch using bcrypt compare
const updatePassword = async (oldPassword: string, newPassword: string, user_id: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    await prisma.users.findUnique({
        where: { user_id: user_id }
    })
        .then(async (data) => {
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


// profile update
const updateProfile = async (nickname: string, phoneNumber: string, user_id: number) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.update({
    where: { user_id: user_id },
    data: {
      nickname: nickname,
      phone: phoneNumber
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

export  { getProfile, updateProfile,updatePassword, updateEmail, getChallengeStatistics}