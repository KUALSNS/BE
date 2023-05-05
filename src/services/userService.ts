import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
const prisma = new PrismaClient();

const userEmailSelect =  async (userEmail: string) => {
  const connection = await mysql.createConnection(DATA_SOURCES.development);
  try {
    await connection.connect();
    const  userSelect : string = `select user_id, role, password from users where identifier = '${String(userEmail)}'; `;
    const userSelectResult : any  = await connection.query(userSelect);
    return userSelectResult[0][0];
  } catch (error) {
    console.log(error);
  } finally {
    await connection.end();
  }
}

//registerUser function using prisma
const signUpUser = async (
  userId: string,
  nickName: string,
  email: string,
  password : string
) => {
  try {
    const user = await prisma.user.create({
      data: {
        user_id: "userIdsss",
        nickname: "nickNasssme",
        email: "lala@naver.com",
        password:"ddpos",
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
};


export  { userEmailSelect,
  signUpUser 
}

