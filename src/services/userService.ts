import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * 
 * @param userIdentifier 유저 아이디
 * @returns 1. 유저에 대한 아이디, 권한, 비밀번호
 *          2. 오류 시 false반환
 */
const userInformationSelectData = async (userIdentifier: string) => {
  try {
    const connection = await mysql.createConnection(DATA_SOURCES.development);
    await connection.connect();

    const userSelect = `select * from users where identifier = '${String(userIdentifier)}'; `;
    const userSelectResult = await connection.query(userSelect);
    await connection.end();


    const rowData = userSelectResult[0] as mysql.RowDataPacket[];
    const userElement = rowData[0];
    return userElement;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed ${__dirname} userInformationSelectData function`);
  }
}

/**
 * 
 * @param email         유저 이메일
 * @param password      유저 비밀번호(해시)
 * @param nickname      유저 닉네임
 * @param identifier    유저 아이디
 * @param phoneNumber   유저 핸드폰 번호
 */
const userSignupData = async (
  email: string,
  password: string,
  nickname: string,
  identifier: string,
  phoneNumber: string
) => {
  try {

    await prisma.users.create({
      data: {
        identifier : identifier,
        password: password,
        email : email,
        nickname : nickname,
        phone : phoneNumber,
        role : "user"
      }
    })
  } catch (error) {
    console.log(error);

  throw new Error(`Failed ${__dirname} userSignupData function`);
  }
};


/**
 * 유저 아이디 조회 함수
 * @param userEmail 유저 이메일
 * @returns 1. 유저 아이디 반환
 *          2. 실패 시 false 반환
 */
const userIdentifierData = async (userEmail: string) => {
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
    throw new Error(`Failed ${__dirname} userIdentifierData function`);
  }
}


/**
 * 임시 비밀 번호 업데이트 함수
 * @param userIdentifier 유저 아이디
 * @param userEmail      유저 이메일
 * @param encryptedPassword  암호화 된 비밀번호
 * @param randomPassword     랜덤 비밀 번호
 * @returns   1. 랜덤 비밀 번호
 *            2. 실패 시 false 반환
 */
const updatePasswordData = async (userIdentifier: string, userEmail: string, encryptedPassword: string) => {
  try {

    await prisma.users.updateMany({
      where: {
        identifier: userIdentifier,
        email: userEmail
      },
      data: {
        password: encryptedPassword
      }
    });
    return;

  } catch (error) {
    console.log(error);
    throw new Error(`Failed ${__dirname} updatePasswordData function`);
  }
}


/**
 * 
 * @param kakaoEmail     카카오 이메일
 * @param kakaoNickname  카카오 닉네임
 * @returns 
 */
const kakaoSignUpData = async (kakaoEmail: string, kakaoNickname: string) => {
  try {

    await prisma.users.create({
      data: {
        role: "user",
        identifier: kakaoEmail,
        nickname: kakaoNickname,
        password: '',
        email: '',
        phone: '',
      }
    });
    return;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed ${__dirname} kakaoSignUpData function`);
  }
}









export { userInformationSelectData, userSignupData, userIdentifierData, updatePasswordData, kakaoSignUpData }

