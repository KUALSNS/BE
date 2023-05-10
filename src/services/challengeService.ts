import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
const prisma = new PrismaClient();


const beforeMainData = async () => {
  try {
    const challengesArray: {
      title: string;
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
      return [{ "title": e.title, "category": e.category.name }]

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
      category: string;
    }[] = [];
    const challengesDB = await prisma.challenges.findMany({
      select: {
        title: true,
        category: {
          select: {
            name: true,
          }
        }
      }
    });
    const challenges = challengesDB.map((e) => {
      return [{ "title": e.title, "category": e.category.name }]
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
    const challengesArray: {
      title: string;
      category: string;
    }[] = []
    const categoryDB = await prisma.category.findMany({
      where: {
        name: oneCategory
      },
      select: {
        name: true,
        challenges: {
          select: {
            title: true,
          }
        }
      }
    });
    for (var i = 0; i < categoryDB[0].challenges.length; i++) {
      const category = categoryDB.map((e) => {
        return [{ "title": e.challenges[i].title, "category": e.name }]
      });
      challengesArray.push(category[0][0]);
    }
    prisma.$disconnect();
    return challengesArray
  } catch (error) {
    console.log(error);
  }
};

const manyCategoryData = async (manyCategory: string[] | string) => {
  try {
    const challengesArray: {
      title: string;
      category: string;
    }[] = [];
    if (typeof manyCategory == 'string') {
      const categoryDB = await prisma.category.findMany({
        where: {
          name: manyCategory
        },
        select: {
          name: true,
          challenges: {
            select: {
              title: true,
            }
          }
        }
      });
      for (var i = 0; i < categoryDB[0].challenges.length; i++) {
        const category = categoryDB.map((e) => {
          return [{ "title": e.challenges[i].title, "category": e.name }]
        });
        challengesArray.push(category[0][0]);
      }
      console.log(challengesArray);

      prisma.$disconnect();
      return challengesArray;
    }
    else {
      for (var i = 0; i < manyCategory.length; i++) {
        const categoryDB = await prisma.category.findMany({
          where: {
            name: manyCategory[i]
          },
          select: {
            name: true,
            challenges: {
              select: {
                title: true,
              }
            }
          }
        });
        for (var j = 0; j < categoryDB[0].challenges.length; j++) {
          const category = categoryDB.map((e) => {
            return [{ "title": e.challenges[j].title, "category": e.name }]
          });
          challengesArray.push(category[0][0]);
        }
      }
      prisma.$disconnect();
      return challengesArray
    }
  } catch (error) {
    console.log(error);
  }
};

const challengeSearchData = async (challengeSearch: string) => {
  try {
    const challengesArray: {
      title: string;
      category: string;
    }[] = [];
    const challengeSearchData = challengeSearch.replace(/ /g, "");
    const challengesDB = await prisma.challenges.findMany({
      where: {
        title: {
          contains: challengeSearchData
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
    const challenges = challengesDB.map((e) => {
      return [{ "title": e.title, "category": e.category.name }]
    });
    for (var j = 0; j < challengesDB.length; j++) {
      challengesArray.push(challenges[j][0]);
    }
    console.log(challengesArray);
    prisma.$disconnect();
    return challengesArray
  } catch (error) {
    console.log(error);
  }
};


export { beforeMainData, wholeCategoryData, oneCategoryData, manyCategoryData, challengeSearchData }