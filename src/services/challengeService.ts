import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth'
import mysql from 'mysql2/promise'
const prisma = new PrismaClient()


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

const afterMainData = async (user_id: number) => {
  try {
  
    console.log(1);
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