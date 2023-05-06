import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
import { serviceReturnForm } from '../modules/service-modules';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();


const userEmailSelect =  async ( userIdentifier: string) => {
  console.log(2);
  const connection = await mysql.createConnection(DATA_SOURCES.development);
  console.log(3);
  await connection.connect();
  try {
    
    const  userSelect : string = `select user_id, role, password from users where identifier = '${String(userIdentifier)}'; `;
    const userSelectResult : any  = await connection.query(userSelect);
    return userSelectResult[0][0];
  } catch (error) {
    console.log(error);
  } finally {
     connection.end();
  }
}

//registerUser function using prisma


// const signUpService = async (
//   email: string,
//   password: string,
//   nickname: string,
//   userId : string,
// ) => {
//   const returnForm: serviceReturnForm = {
//     status: 500,
//     message: "server error",
//     responseData: {},
//   };

//   // * Validate if email already exists
//   let isEmailExist = false;
//   await prisma.users.findFirst({ where: { email: email } })
//     .then((data) => {
//       if (data) {
//         isEmailExist = true;
//         returnForm.status = 400;
//         returnForm.message = "Email already exist";
//       }
//     })
//     .catch((e) => {
//       console.log(e);
//       returnForm.status = 500;
//       returnForm.message = "Server Error";
//       return;
//     });

//   // * Create User only when email not exists
//   if (!isEmailExist) {
//     const TOKEN_KEY = process.env.TOKEN_KEY || "";

//     // * Encrypt user password
//     let encryptedPassword = await bcrypt.hash(password, 10);
//     // console.log(email)
//     // const token = jwt.sign({ email }, TOKEN_KEY, {
//     //   expiresIn: "20h",
//     // });

//     await prisma.users.create({
//       data: {
//         identifier: userId,
//         nickname: nickname,
//         email: email,
//         password:password,
//       },
//     })
//       .then((data) => {
//         returnForm.status = 200;
//         returnForm.message = "SignUp Success";
//       })
//       .catch((e) => {
//         console.log(e);
//         returnForm.status = 500;
//         returnForm.message = "Server Error";
//       });
//   }
//   return returnForm;
// };


export  { userEmailSelect,
//  signUpService 
}

