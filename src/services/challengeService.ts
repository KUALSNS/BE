import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth'
import mysql from 'mysql2/promise'
const prisma = new PrismaClient()

/**
 * 로그인 이전 메인 페이지 DB함수
 * @returns  1. 카테고리와 챌린지 데이터 반환
 *           2. 오류 시 false 반환
 */
const beforeMainData = async () => {
  try {
  
    const [categoryDB, challengesDB] = await Promise.all([
      prisma.category.findMany({
        where: {
          type: "챌린지"
        },
        select: {
          name: true,
        }
      }),
      prisma.challenges.findMany({
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
    ])
 
    prisma.$disconnect();
    return {
      categoryDB, 
      challengesDB
    }
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    return false;

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
    return false;
  }
};

/**
 * 
 * @param user_id 유저 아이디 
 * @returns 1.  카테고리, 챌린지 데이터, 유저의 챌린지 개수, 챌린지별 달성률, 쿠폰 사용 유무 반환
 *          2. 오류 시 false 반환 
 */
const afterMainData = async (user_id: number) => {
  try {
  
    const [categoryDB, challengesDB, userDB, userChallengeCountDB] = await Promise.all([
      prisma.category.findMany({
        where: {
          type: "챌린지"
        },
        select: {
          name: true,
        }
      }),
      prisma.challenges.findMany({
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
      }),
      prisma.users.findMany({
        where: {
          user_id: user_id
        },
        select: {
          nickname: true,
          coopon: true
        }
      }),
      prisma.user_challenges.findMany({
        where: {
          user_id: user_id
        },
        select: {
          challenges: {
            select: {
              title: true,
            }
          },
          user_challenge_templetes: {
            where: {
              complete: true
            },
            select: {
              title: true
            }
          }
        }
      })
    ]);
    console.log(categoryDB);
    prisma.$disconnect();
    return {
      categoryDB, challengesDB, userDB, userChallengeCountDB    
    };
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
    return false;
  }
}



export {
  beforeMainData, challengeSearchData, afterMainData,
}