import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export async function getCompletedChallenges(userId: any, startDate: string, finishDate: string) {
    try {
        // get user's completed challenges templates within the specified date range
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            include: {
                user_challenges: {
                    where: { complete: true },
                    include: {
                        user_challenge_templetes: true,
                    },
                },
            },
        });
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



// service function which give data to controller, it receives userid, startdate, finishdate and returns user's completed challenges within the specified date range
export async function getPlanner(userId: number, startDate: Date, finishDate: Date) {
    try {
        // Fetch completed challenges for the given user
        const completedChallenges = await prisma.user_challenges.findMany({
        where: {
            user_id: userId,
            complete: true,
            finish_at: {
            gte: startDate,
            lte: finishDate,
            },
        },
        include: {
            challenges: true,
        },
        });

        // Process completed challenges and extract the completion dates
        const completedDates = completedChallenges.map((challenge) => {
        return {
            chalId: challenge.chal_id,
            completionDate: challenge.finish_at,
        };
        });

        return completedDates;
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return { error: 'Internal server error' };
    }
}

export async function getUserChallengeHistory(userId: number) {
    const user = await prisma.users.findUnique({
        where: {user_id: userId},
        include: {
            user_challenges: {
                include: {
                    challenges: true,
                    user_challenge_templetes: {
                        orderBy: {update_at: 'desc'},
                        take: 1,
                    },
                },
            },
        },
    });

    const ongoingChallenges = user?.user_challenges.filter(
        // 시작했고, 끝나지 않은 챌린지
        (challenge) => !challenge.complete && challenge.finish_at === null
    );

    const finishedChallenges = user?.user_challenges.filter(
        // 끝난 챌린지
        (challenge) => challenge.complete
    );

    const temporarilySavedChallenges = user?.user_challenges.filter(
        //임시저장 챌린지
        (challenge) => !challenge.complete && challenge.finish_at !== null
    );

    return {
        ongoingChallenges,
        finishedChallenges,
        temporarilySavedChallenges,
    };
}


