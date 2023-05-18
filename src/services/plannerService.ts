import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export async function getCompletedChallenges(userId: any, startDate: Date, finishDate: Date) {
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


// service function which give data to controller, it receives userid and returns all of user's challenges divide by completed and uncompleted with it's recent content
export async function getUserChallengeContent(userId: number) {
    try {
        // Fetch completed challenges for the given user
        const completedChallenges = await prisma.user_challenges.findMany({
        where: {
            user_id: userId,
            complete: true,
        },
        include: {
            challenges: true,
        },
        });

        // Fetch uncompleted challenges for the given user
        const uncompletedChallenges = await prisma.user_challenges.findMany({
        where: {
            user_id: userId,
            complete: false,
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

        // Process uncompleted challenges and extract the completion dates
        const uncompletedDates = uncompletedChallenges.map((challenge) => {
        return {
            chalId: challenge.chal_id,
            completionDate: challenge.finish_at,
        };
        });

        return {completedDates, uncompletedDates};
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        return { error: 'Internal server error' };
    }
}

