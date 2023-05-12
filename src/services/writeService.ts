import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
const prisma = new PrismaClient();




const newChallengeData = async (user_id: number, newChallenge: string) => {
    try {
      const challengTemplateDB = await prisma.user_challenge_templetes.findMany({
  
        select: {
          created_at: true
        }
  
      });
      console.log(challengTemplateDB[0].created_at)
      const [userCooponDB, challengesCountDB, challengesOverlapDB] = await Promise.all([
        await prisma.users.findUnique({
          where: {
            user_id: user_id
          },
          select: {
            coopon: true
          }
        }),
        await prisma.user_challenges.aggregate({
          where: {
            user_id: user_id
          },
          _count: {
            uchal_id: true
          }
        }),
        await prisma.challenges.findMany({
          where: {
            title: newChallenge
          },
          select: {
            user_challenges: {
              select: {
                chal_id: true
              }
            }
          }
        })
      ])
  
      const coopon = userCooponDB?.coopon;
      const challengesCount = challengesCountDB._count.uchal_id;
      const challengesOverlap = challengesOverlapDB[0].user_challenges[0];
      prisma.$disconnect();
      return {
        coopon,
        challengesCount,
        challengesOverlap
      }
  
    } catch (error) {
      prisma.$disconnect();
      console.log(error);
    }
  };
  
  const startChallengeData = async (user_id: number, newChallenge: string) => {
    try {
      const chalId = await prisma.challenges.findMany({
        where: {
          title: newChallenge
        },
        select: {
          chal_id: true
  
        }
      });
      const chalIdData = chalId[0].chal_id;
      await prisma.user_challenges.create({
        data: {
          user_id: user_id,
          chal_id: chalIdData
        }
      });
  
      prisma.$disconnect();
      return { chalIdData, newChallenge };
  
    } catch (error) {
      console.log(error);
      prisma.$disconnect();
      return false;
    }
  };
  
  const newChallengeResult = async (user_id: number, challenge_id: number, newChallenge: string) => {
    try {
      const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
      const isoDate = new Date(date).toISOString().slice(0, 10) + "T00:00:00.000Z";
      const realDate = new Date(isoDate);
      console.log(realDate);
      const challengTemplateArray: {
        challenge: string;
        category: string;
        "template-title": string;
        "template-content": string;
      }[] = [];
      const relativeChallengeArray = [];
  
      const [challengTemplateDB, relativeChallengeDB] = await Promise.all([
        await prisma.challenges.findMany({
          where: {
            chal_id: challenge_id
          },
          select: {
            title: true,
            category: {
              select: {
                name: true
              },
            },
            templates: {
              select: {
                title: true,
                content: true
              }
            }
          }
        }),
        await prisma.user_challenges.findMany({
          where: {
            user_id: user_id
          },
          select: {
            challenges: {
              select: {
                title: true
              }
            },
            user_challenge_templetes: {
              where: {
                created_at: realDate,
              },
              select: {
                uctem_id: true
              }
            }
          }
        })
      ]);
      for (var i = 0; i < challengTemplateDB[0].templates.length; i++) {
        const challengTemplate = challengTemplateDB.map((e) => {
          return [{
            "challenge": e.title, "category": e.category.name,
            "template-title": e.templates[i].title,
            "template-content": e.templates[i].content
          }]
        });
        challengTemplateArray.push(challengTemplate[0][0]);
      }
  
      for (var i = 0; i < relativeChallengeDB.length; i++) {
        if (!relativeChallengeDB[i].user_challenge_templetes) {
          const relativeChallengeMap = relativeChallengeDB.map((e) => {
            return e.challenges;
          });
          relativeChallengeArray.push(relativeChallengeMap[i].title);
        }
      }
  
      const valueFilter = relativeChallengeArray.filter((element) => element !== newChallenge);
      valueFilter.unshift(newChallenge);
      prisma.$disconnect();
      return { valueFilter, challengTemplateArray };
    } catch (error) {
      console.log(error);
      prisma.$disconnect();
    }
  };

  export {
    newChallengeData, startChallengeData, newChallengeResult
  
  }