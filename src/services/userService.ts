import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { serviceReturnForm } from '../modules/responseHandler';
import { randomPasswordFunction } from '../modules/randomPassword';
const prisma = new PrismaClient();



/**
 * 
 * @param userIdentifier 유저 아이디
 * @returns 1. 유저에 대한 아이디, 권한, 비밀번호
 *          2. 오류 시 false반환
 */
const userIdentifierSign = async (userIdentifier: string) => {
  const connection = await mysql.createConnection(DATA_SOURCES.development);
  await connection.connect();
 
  try {
    const userSelect: string = `select user_id, role, password from users where identifier = '${String(userIdentifier)}'; `;
    const userSelectResult = await connection.query(userSelect);
    await connection.end();

    const rowData = userSelectResult[0] as mysql.RowDataPacket[];
    const userElement = rowData[0]; 
    return userElement;
  } catch (error) {
    console.log(error);
    return false;
  } 
}




//registerUser function using prisma
const userSignup = async (
  email: string,
  password: string,
  nickname: string,
  userId: string,
  phoneNumber: string
) => {
  const returnForm: serviceReturnForm = {
    status: 500,
    message: "server error",
    responseData: {},
  };
  // * Validate if email already exists
  let isEmailExist = false;
  await prisma.users.findFirst({ where: { email: email } })
    .then((data) => {
      if (data) {
        isEmailExist = true;
        returnForm.status = 400;
        returnForm.message = "Email already exist";
      }
    })
    .catch((e) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on email check process";
      return returnForm; // Add return statement here
    });
  // check if identifier already exists
  let isIdentifierExist = false;
  await prisma.users.findFirst({ where: { identifier: userId } })
    .then((data) => {
      if (data) {
        isIdentifierExist = true;
        returnForm.status = 400;
        returnForm.message = "Identifier already exist";
      }
    }
    )
    .catch((e) => {
      console.log(e);
      returnForm.status = 500;
      returnForm.message = "Server Error on identifier check process";
      return returnForm; // Add return statement here
    }
    );

  // * Create User only when email not exists
  if (!isEmailExist && !isIdentifierExist) {
    //const TOKEN_KEY = process.env.TOKEN_KEY || "";

    // * Encrypt user password
    let encryptedPassword = await bcrypt.hash(password, 10);
    // console.log(email)
    // const token = jwt.sign({ email }, TOKEN_KEY, {
    //   expiresIn: "20h",
    // });

    // * Create User typescript error catching
    await prisma.users
      .create({
        data: {
          email: email,
          password: encryptedPassword,
          nickname: nickname,
          identifier: userId,
          phone: phoneNumber,
          role: "user",
        },
      })
      .then((data) => {
        if (data) {
          returnForm.status = 200;
          returnForm.message = "Success";
          data.password = ""
          returnForm.responseData = data;
        } else {
          returnForm.status = 400;
          returnForm.message = "User Not Found";

        }
      })
      .catch((e) => {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on create user process";
        return returnForm; // Add return statement here
      }
      );
  }
  return returnForm;
};


const userId = async (userEmail: string) => {
  try {
    const userIdDB = await prisma.users.findMany({
      where: {
        email: userEmail
      },
      select: {
        identifier: true
      }
    });
    return userIdDB;

  } catch (error) {
    console.log(error);
  }
}


const userIdentifier = async (userIdentifier: string) => {
  try {
    const userIdDB = await prisma.users.findMany({
      where: {
        identifier: userIdentifier
      },
      select: {
        user_id: true
      }
    });
    return userIdDB;

  } catch (error) {
    console.log(error);
  }
}



const updatePassword = async (userIdentifier: string, userEmail: string) => {
  try {
    const randomPassword = randomPasswordFunction();
    const encryptedPassword = await bcrypt.hash(randomPassword, 10);
    await prisma.users.updateMany({
      where: {
        identifier: userIdentifier,
        email: userEmail
      },
      data: {
        password: encryptedPassword
      }
    });
    return randomPassword;

  } catch (error) {
    console.log(error);
  }
}


export { userIdentifierSign, userSignup, userId, updatePassword, userIdentifier }

