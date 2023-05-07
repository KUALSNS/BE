import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
const prisma = new PrismaClient();


const beforeMainData = async () => {
  try {
    const challengesArray: {
      title: string;
      content: string;
      category: string;
    }[] = [];
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
          content: true,
          category: {
            select: {
              name: true,
            }
          }
        }
      })
    ]);
    const category = categoryDB.map((e) => {
      return e.name
    });
    const challenges = challengesDB.map((e) => {
      return [{ "title": e.title, "content": e.content, "category": e.category.name }]

    });
    for (var i = 0; i < challenges.length; i++) {
      challengesArray.push(challenges[i][0]);
    }
    prisma.$disconnect();
    return {
      category,
      challengesArray
    };
  } catch (error) {
    console.log(error);
  }
}

const wholeCategoryData = async () => {
  try {
    const challengesArray: {
      title: string;
      content: string;
      category: string;
    }[] = [];
    const challengesDB = await prisma.challenges.findMany({
      select: {
        title: true,
        content: true,
        category: {
          select: {
            name: true,
          }
        }
      }
    });
    const challenges = challengesDB.map((e) => {
      return [{ "title": e.title, "content": e.content, "category": e.category.name }]
    });
    for (var i = 0; i < challenges.length; i++) {
      challengesArray.push(challenges[i][0]);
    }
    prisma.$disconnect();
    return challengesArray
  } catch (error) {
    console.log(error);
  }
};

const oneCategoryData = async (oneCategory: string) => {
  try {
    const challengesDB = await prisma.category.findMany({
      where: {
        name: oneCategory
      },
      select: {
        challenges: {
          select: {
            title: true,
            content: true
          }
        }
      }
    });
    const challengesArray = challengesDB[0].challenges
    prisma.$disconnect();
    return challengesArray
  } catch (error) {
    console.log(error);
  }
};

const manyCategoryData = async (manyCategory: string[] | string) => {
  try {
    const challengesArray = []
    if (typeof manyCategory == 'string') {
      const challengesDB = await prisma.category.findMany({
        where: {
          name: manyCategory
        },
        select: {
          challenges: {
            select: {
              title: true,
              content: true
            }
          }
        }
      });
      prisma.$disconnect();
      return challengesDB[0].challenges
    }
    else {
      for (var i = 0; i < manyCategory.length; i++) {
        const challengesDB = await prisma.category.findMany({
          where: {
            name: manyCategory[i]
          },
          select: {
            challenges: {
              select: {
                title: true,
                content: true
              }
            }
          }
        });
        for (var j = 0; j < challengesDB[0].challenges.length; j++) {
          challengesArray.push(challengesDB[0].challenges[j]);
        }
      }
      prisma.$disconnect();
      return challengesArray
    }
  } catch (error) {
    console.log(error);
  }
};


export { beforeMainData, wholeCategoryData, oneCategoryData, manyCategoryData }