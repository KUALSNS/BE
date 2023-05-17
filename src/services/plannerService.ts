import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export async function getPlanner(req: Request, res: Response) {
  try {
    const { startDate, finishDate } = req.query;

    // Convert start and finish dates to JavaScript Date objects
    const start = new Date(startDate as string);
    const finish = new Date(finishDate as string);

    // Fetch completed challenges within the specified date range
    const completedChallenges = await prisma.user_challenges.findMany({
      where: {
        complete: true,
        finish_at: {
          gte: start,
          lte: finish,
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

    res.json(completedDates);
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
