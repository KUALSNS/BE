import { serviceReturnForm } from '../modules/responseHandler';
import { prisma } from '@prisma/client';

const profileService = async (userId: string) => {
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

export  { profileService}