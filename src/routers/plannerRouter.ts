import express from 'express';
import * as PlannerController from '../controllers/plannerController.js'
import {verifyToken} from "../middleware/auth.js";
const router = express.Router();



router.get('/calendar',verifyToken,PlannerController.getPlannerData);
router.get('/history',verifyToken,PlannerController.getUserChallengeHistory);
router.get('/statistic',verifyToken,PlannerController.getUserStatistics);



export default router