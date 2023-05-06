import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
const prisma = new PrismaClient();


const beforeMainData = async () => {
  try {
    const challengesArray = [];
    const categoryDB = await prisma.category.findMany({
      where: {
        type: "챌린지"
      },
      select: {
        name: true,
      }
    });
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
    const challengesArray = [];
 
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
}


export { beforeMainData, wholeCategoryData }