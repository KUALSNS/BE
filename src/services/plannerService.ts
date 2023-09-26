import {PrismaClient, user_challenges} from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 나누기, 프리즈마 부분
export async function getCompletedChallenges(userId: number, startDate: string, finishDate: string) {
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            include: {
                user_challenges: {
                    include: {
                        user_challenge_templetes: {
                            where: {
                                complete: true,
                                update_at: {
                                    gte: new Date(startDate),
                                    lte: new Date(finishDate),
                                },
                            },
                        },
                    },
                },
            },
        });

        const completedDates: Date[] = [];
        const uniqueCompletedDates: Set<string> = new Set();

        user?.user_challenges.forEach((challenge) => {
            challenge.user_challenge_templetes.forEach((template) => {
                if (template.complete && !uniqueCompletedDates.has(template.update_at.toISOString())) {
                    uniqueCompletedDates.add(template.update_at.toISOString());
                    completedDates.push(template.update_at);
                }
            });
        });

        return completedDates;
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        throw new Error('Internal server error' + error);
    }
}
async function getMonthStatistics(userId: number) {
    const finishDate = new Date();
    finishDate.setMonth(finishDate.getMonth() + 1);
    finishDate.setDate(0);
    const startDate = new Date();
    startDate.setDate(1);

    const thisMonth = await getCompletedChallenges(userId, startDate.toISOString(), finishDate.toISOString());
    finishDate.setMonth(finishDate.getMonth() - 1);
    startDate.setMonth(startDate.getMonth() - 1);
    const lastMonth = await getCompletedChallenges(userId, startDate.toISOString(), finishDate.toISOString());
    // calculate user's ongoing challenge number this month
    const ongoingChallengesCount = await prisma.user_challenges.count({
          where: {
              user_id: userId,
              complete: false,
          },
      },
    );

    const thisMonthCount = Object.values(thisMonth).length;
    const lastMonthCount = Object.values(lastMonth).length;
    let comparisonWord = '';
    if (thisMonthCount > lastMonthCount) {
        comparisonWord = (thisMonthCount - lastMonthCount) + '일 더';
    } else if (thisMonthCount < lastMonthCount) {
        comparisonWord = (lastMonthCount - thisMonthCount) + '일 덜';
    } else {
        comparisonWord = '똑같게';
    }
    // return user's statistics this month, last month count values and ongoing challenge number
    return {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        comparisonWord: comparisonWord,
        ongoing: ongoingChallengesCount,
        missed: 30 - thisMonthCount,
    };
}
export function getDateRangeStartingSunday() {
    const today = new Date();
    const currentDay = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const startDate = new Date(today); // Clone today's date

    // Calculate the start date of the week (previous Sunday)
    startDate.setDate(today.getDate() - currentDay);

    // Calculate the end date of the week (next Saturday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
        startDate,
        endDate,
    };
}


async function getWeekStatistics(userId: number) {
    const { startDate, endDate } = getDateRangeStartingSunday();
    const thisWeek = await getCompletedChallenges(userId, startDate.toISOString(), endDate.toISOString());
    console.log(thisWeek);
    // calculate startDate to 7 days before
    startDate.setDate(startDate.getDate() - 7);
    endDate.setDate(endDate.getDate() - 7);

    const lastWeek = await getCompletedChallenges(userId, startDate.toISOString(), endDate.toISOString());



    // const finishDate = new Date();
    // const startDate = new Date();
    // startDate.setDate(startDate.getDate() - 7);
    // const thisWeek = await getCompletedChallenges(userId, startDate.toISOString(), finishDate.toISOString());
    // finishDate.setDate(finishDate.getDate() - 7);
    // startDate.setDate(startDate.getDate() - 7);
    // const lastWeek = await getCompletedChallenges(userId, startDate.toISOString(), finishDate.toISOString());
    console.log(lastWeek);
    console.log(thisWeek);

    // erase duplicate in this week and last week

    const thisWeekCount = Object.values(thisWeek).length;
    const lastWeekCount = Object.values(lastWeek).length;

    let comparisonWord = '';
    if (thisWeekCount > lastWeekCount) {
        comparisonWord = (thisWeekCount - lastWeekCount) + '일 더';
    } else if (thisWeekCount < lastWeekCount) {
        comparisonWord = (lastWeekCount - thisWeekCount) + '일 덜';
    } else {
        comparisonWord = '똑같게';

    }
    const ongoingChallengesCount = await prisma.user_challenges.count({
          where: {
              user_id: userId,
              complete: null,
          },
      },
    );
    return {
        thisWeekCount: thisWeekCount,
        lastWeekCount: lastWeekCount,
        comparisonWord: comparisonWord,
        ongoing: ongoingChallengesCount,
        missed: 7 - thisWeekCount,
        thisWeek: thisWeek,
        lastWeek: lastWeek,
    };
}

export async function getUserStatistics(userId: number, period: string) {
    try {
        // if user's coopon filed is 1 return month, week if 0 return only month
        const userCoupon = await prisma.users.findUnique({
            where: { user_id: userId },
            select: { coopon: true },
        }
        );
        if (userCoupon) {
            const month = await getMonthStatistics(userId);
            const week = await getWeekStatistics(userId);
            return { month: month, week: week };

        } else {
            const month = await getMonthStatistics(userId);
            return { month: month };
        }

    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return { error: 'Internal server error' };
    }

}



export async function getUserChallengeHistory(userId: number) {
    try {
        const users = await prisma.users.findUnique({
            where: { user_id: userId },
            include: {
                user_challenges: {
                    include: {
                        challenges: {
                            include: {
                                category: true,
                            }
                        },
                        user_challenge_templetes: {
                            orderBy: {update_at: 'desc'},
                            //take: 1,
                        },
                    },
                },
            },
        });
        //console.log(users)

        const ongoingChallenges: user_challenges[] = [];
        const finishedChallenges: user_challenges[] = [];
        const temporarilySavedChallenges: user_challenges[] = [];

        const userChallenges = users?.user_challenges;
        if (userChallenges == undefined || userChallenges.length == 0) {
            // 가능한 챌린지 보여주기
        } else {
            userChallenges.forEach((challenge) => {
                const completedTemplatesCount = challenge.user_challenge_templetes.filter(
                  (template) => template.complete
                ).length;
                const completionRatio = completedTemplatesCount / 30;
                const achievement = Math.round(completionRatio * 100);
                // @ts-ignore
                challenge.achievement = achievement;
            });
            userChallenges.forEach((userChallenge) => {
                if (userChallenge.user_challenge_templetes.length != 0) {
                    if (userChallenge.complete) {
                        finishedChallenges.push(userChallenge);
                    } else if (userChallenge.complete == false) {
                        ongoingChallenges.push(userChallenge);
                    } else {
                        temporarilySavedChallenges.push(userChallenge);
                    }
                }
            });
        }


        console.log('Ongoing Challenges:', ongoingChallenges);
        console.log('Finished Challenges:', finishedChallenges);
        console.log('Temporarily Saved Challenges:', temporarilySavedChallenges);
        return {
            ongoingChallenges,
            finishedChallenges,
            temporarilySavedChallenges,
        };
    } catch (error) {
        console.error('Error retrieving user challenge history:', error);
        throw error;
    }
}


/**
 * 
 * @param userId 
 * @returns  유저가 참여한 챌린지 데이터 조회
 */
export const  getUserChallengeData = async (userId: number) => {
    try {

        const userChallenge = await prisma.user_challenges.findMany({
            select :{
                complete:true,
     //           start_at:true,
                finish_at:true,
                challenges :{
                    select:{
                        title:true,
                        category:{
                            select:{
                                name:true
                            }
                        }
                    }
                }
            },
            where:{
                user_id: userId
            }
        })
     
        return userChallenge;
    } catch (error) {
        throw new Error(`Failed ${__dirname} getUserChallengeDB function`);
    }
}


/**
 * 
 * @param userId 
 * @param challenge 
 * @returns  유저가 진행 중인 챌린지의 템플릿 데이터 조회
 */
export const getUserChallengeTemplateData = async (userId: number, challenge : string) => {
    try {

        const userChallengeTemplate = await prisma.challenges.findMany({
            select:{
                user_challenges :{
                    select:{
                        user_challenge_templetes:{
                            orderBy: {update_at: 'desc'},
                            select:{
                                title:true,
                                writing:true,
                                created_at:true
                            }
                        },                   
                    },
                    where:{
                        user_id:userId
                    }
                },
                category :{
                    select:{
                        name : true,
                        emogi: true
                    }
                }
            },
            where:{
                title: challenge
            }
     
        })
     
        return userChallengeTemplate;
    } catch (error) {
        throw new Error(`Failed ${__dirname} getUserChallengeTemplateData function`);
    }
}
