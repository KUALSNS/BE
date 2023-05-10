import { serviceReturnForm } from '../modules/responseHandler';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getProfile = async (userId: number) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.findUnique({ where: { user_id: userId } })
    .then((data) => {
      if (data) {
        returnForm.status = 200;
        returnForm.message = "Success";
        // delete password from data without ts error
        //delete data.password
        console.log(data)
        returnForm.responseData = data
      } else {
        returnForm.status = 400;
        returnForm.message = "User Not Found";
      }
    })
    .catch((e: any) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on get profile process";
    });
  return returnForm;
}

// password update with hashing using try catch
const updatePassword = async (password: string, user_id: number) => {
    const returnForm: serviceReturnForm = {
        status: 500,
        message: "server error",
        responseData: {},
    };
    await prisma.users.update({
        where: { user_id: user_id },
        data: {
        password: password
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

export  { getProfile, updateProfile,updatePassword}