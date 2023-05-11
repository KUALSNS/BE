import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { serviceReturnForm } from '../modules/responseHandler';
const prisma = new PrismaClient();
//import { v4 as uuidv4 } from 'uuid';



const userIdentifierSelect = async (userIdentifier: string) => {
  const connection = await mysql.createConnection(DATA_SOURCES.development);
  await connection.connect();
  try {
    const userSelect: string = `select user_id, role, password from users where identifier = '${String(userIdentifier)}'; `;
    const userSelectResult: any = await connection.query(userSelect);
    return userSelectResult[0][0];
  } catch (error) {
    console.log(error);
  } finally {
    await connection.end();
  }
}



//registerUser function using prisma
const userSignup = async (
  email: string,
  password: string,
  nickname: string,
  userId : string,
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
    const TOKEN_KEY = process.env.TOKEN_KEY || "";

    // * Encrypt user password
    let encryptedPassword = await bcrypt.hash(password, 10);
    // console.log(email)
    // const token = jwt.sign({ email }, TOKEN_KEY, {
    //   expiresIn: "20h",
    // });

    await prisma.users.create({
      data: {
        //user_id: userId,
        nickname: nickname,
        email: email,
        password: encryptedPassword,
        phone: phoneNumber,
        role: "USER",
        identifier: userId,
      },
    })
      .then((data) => {
        returnForm.status = 200;
        returnForm.message = "SignUp Success";
        returnForm.responseData = data.identifier;
      })
      .catch((e) => {
        console.log(e);
        returnForm.status = 500;
        returnForm.message = "Server Error on SignUp process";
      });
  }
  return returnForm;
};


export  { userIdentifierSelect,  userSignup}

