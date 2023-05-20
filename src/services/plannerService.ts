import {PrismaClient, user_challenges} from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export async function getCompletedChallenges(userId: any, startDate: string, finishDate: string) {
    try {
        // get user's completed challenges templates within startDate and finishDate
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            include: {
                user_challenges: {
                    include: {
                        //challenges: true,
                        user_challenge_templetes: {
                            where: {
                                complete: true,
                                update_at: {
                                    gte: new Date(startDate),
                                    lte: new Date(finishDate),
                                },
                                }
                            }
                        }
                    }
                }
            }
        );
        console.log(user)
        const completedDates: Date[] = [];

        user?.user_challenges.forEach((challenge) => {
            challenge.user_challenge_templetes.forEach((template) => {
                if (template.complete) {
                    completedDates.push(template.update_at);
                }
            });
        });
        return completedDates;
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return { error: 'Internal server error',
            map(e: (challenge: {chal_id: number; finish_at: string}) => {completionDate: string; chalId: number}) {
                
            }
        };
    }

}

export async function getUserStatistics(userId: number, period: string) {
    // challenge participation count this month

    // challenge participation count last month


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
            // 진행률 질문하기
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
                if (userChallenge.complete) {
                    finishedChallenges.push(userChallenge);
                } else if (userChallenge.complete == null) {
                    temporarilySavedChallenges.push(userChallenge);
                } else {
                    ongoingChallenges.push(userChallenge);
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



