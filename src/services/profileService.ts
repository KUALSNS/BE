import { serviceReturnForm } from '../modules/responseHandler';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getProfile = async (userId: string) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.findUnique({ where: { identifier: userId } })
    .then((data) => {
      if (data) {
        returnForm.status = 200;
        returnForm.message = "Success";
        //delete password from data
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

// profile update
const updateProfile = async (nickname: string, phoneNumber: string, identifier: string) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.update({
    where: { identifier: identifier },
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

export  { getProfile, updateProfile}