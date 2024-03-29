import express from 'express';
import * as PlannerController from '../controllers/plannerController.js'
import {verifyToken} from "../middleware/auth.js";
const router = express.Router();



router.get('/calendar',verifyToken,PlannerController.getPlannerData);
router.get('/history',verifyToken,PlannerController.getUserChallengeHistory);
router.get('/statistic',verifyToken,PlannerController.getUserStatistics);
router.get('/user-challenge',verifyToken,PlannerController.getUserChallenge);
router.get('/user-challenge-template/:challenge',verifyToken,PlannerController.getUserChallengeTemplate);

export default router