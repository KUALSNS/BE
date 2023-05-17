import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
import { mainChallengeDTO } from '../interfaces/DTO'
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
    prisma.$disconnect();
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
    prisma.$disconnect();
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
    prisma.$disconnect();
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
    prisma.$disconnect();
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
    prisma.$disconnect();
  }
};

const afterMainData = async (user_id: number) => {
  try {
    const challengesArray: {
      title: string;
      category: string;
    }[] = [];
    const userChallengeArray: {
      challenges: string;
      achievement: number;
    }[] = [];
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
              emogi: true
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
    const nicknameArray = userDB.map((e) => {
      return e.nickname
    });
    const cooponArray = userDB.map((e) => {
      return e.coopon;
    });


    console.log(challengesDB)
    const nickname = nicknameArray[0];
    const coopon = cooponArray[0];


    const userChallengeCount = userChallengeCountDB.map((e) => {
      return [{ "challenges": e.challenges.title, "achievement": Math.round(e.user_challenge_templetes.length * 3.3), "image": e.challenges.emogi }]
    });
    for (var i = 0; i < userChallengeCount.length; i++) {
      userChallengeArray.push(userChallengeCount[i][0]);
    }
    let challengeCertain: boolean;
    const userChallengeSu = userChallengeArray.length;
    if (userChallengeSu == 0) {
      challengeCertain = false;
    } else {
      challengeCertain = true;
    }

    const category = categoryDB.map((e) => {
      return e.name
    });
    const challenges = challengesDB.map((e) => {
      return [{ "title": e.title, "category": e.category.name, "image": e.category.emogi }]

    });

    for (var i = 0; i < challenges.length; i++) {
      challengesArray.push(challenges[i][0]);
    }
    prisma.$disconnect();
    return {
      nickname,
      coopon,
      userChallengeSu,
      "challengeCertain": challengeCertain,
      userChallengeArray,
      category,
      challengesArray
    };
  } catch (error) {
    console.log(error);
    prisma.$disconnect();
  }
}

const newChallengeData = async (user_id: number, newChallenge: string) => {
  try {
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
  beforeMainData, wholeCategoryData, oneCategoryData,
  manyCategoryData, challengeSearchData, afterMainData,
  newChallengeData, startChallengeData, newChallengeResult

}