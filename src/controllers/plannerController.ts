import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from '../middleware/auth';

const prisma = new PrismaClient();

export async function getPlanner(req:Request, res:Response) {
  try {
    const accessToken = (req.headers.access as string).split('Bearer ')[1];
    const authResult = await jwt.verify(accessToken);
    const decoded = jwt.decode(accessToken);
    const userId = decoded!.id;
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
