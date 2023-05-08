import { serviceReturnForm } from '../modules/responseHandler';
import { prisma } from '@prisma/client';

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
        returnForm.responseData = data
      } else {
        returnForm.status = 400;
        returnForm.message = "User Not Found";
      }
    })
    .catch((e) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on get profile process";
    });
  return returnForm;
}

// profile update
const updateProfile = async (nickname: string, phoneNumber: number) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  await prisma.users.update({
    where: { identifier: userId },
    data: {
      nickname: nickname,
      phone: phoneNumber
    }
  })
    .then((data) => {
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
    .catch((e) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on get profile process";
    });
  return returnForm;
}

export  { getProfile, updateProfile}