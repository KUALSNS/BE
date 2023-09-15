import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth.js'
import mysql from 'mysql2/promise'
const prisma = new PrismaClient();
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 모든 카테고리 데이터 반환 함수
 * @returns  1. 모든 카테고리 데이터 반환
 */
const allCategoryData = async () => {
  try {
  
    const categoryDB = await prisma.category.findMany({
        where: {
          type: "챌린지"
        },
        select: {
          name: true,
        }
      })
  
    prisma.$disconnect();
    return categoryDB 
 
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    throw new Error(`Failed ${ __dirname} allCategoryData function`);
  }
}


/**
 * 모든 챌린지 데이터 반환 함수
 * @returns  1. 모든 챌린지 데이터 반환
 */
const allChallengeData = async () => {
  try {
  
    const  challengesDB = await prisma.challenges.findMany({
        select: {
          title: true,
          category: {
            select: {
              name: true,
              emogi: true
            }
          }
        },
        orderBy: {
          category: {
            name: 'asc'
          }
        }
      })
 
    prisma.$disconnect();
    return challengesDB
  
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    throw new Error(`Failed ${__dirname} allChallengeData function`);
  }
}
/**
 * 
 * @param challengeSearch 검색 단어
 * @returns 1.검색 결과 반환
 *          2. 오류 시 false반환
 */
const challengeSearchData = async (challengeSearch: string) => {
  try {
    
    const challengesDB = await prisma.challenges.findMany({
      where: {
        title: {
          contains: challengeSearch
        }
      },
      select: {
        title: true,
        category: {
          select: {
            name: true,
          }
        }
      }
    });
  
 
    prisma.$disconnect();
    return challengesDB
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    throw new Error(`Failed ${__dirname} challengeSearchData function`);
  }
};

/**
 * 
 * @param user_id 유저 아이디 
 * @returns   쿠폰 사용 유무, 닉네임

 */
const userCooponAndNicknameAndIdentifierData = async (userId: number) => {
  try {
  
    const  userDB = await prisma.users.findMany({
        where: {
          user_id: userId
        },
        select: {
          nickname: true,
          coopon: true,
          identifier: true
        }
      })
  
    prisma.$disconnect();
    return userDB   
 
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    throw new Error(`Failed ${__dirname} userCooponAndNicknameData function`);
  }
}

/**
 * 
 * @param user_id 유저 아이디 
 * @returns 유저가 진행 중인 챌린지 이름과 템플릿 이름

 */
const userChallengingData = async (user_id: number) => {
  try {
  
    const userChallengingDB = await prisma.user_challenges.findMany({
        where: {
          user_id: user_id,
          complete : false
         
        },
        select: {
          
          challenges: {
            select: {
              title: true,
            }
          },
          user_challenge_templetes: {
            select: {
              title: true
            }
          }


        }
      })
   
    prisma.$disconnect();
    return userChallengingDB
   
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    throw new Error(`Failed ${__dirname} userChallengingData function`);
  }
}



export {
  allChallengeData, allCategoryData, challengeSearchData, userChallengingData, userCooponAndNicknameAndIdentifierData 
}

