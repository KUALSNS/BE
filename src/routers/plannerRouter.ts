import express from 'express';
import * as PlannerController from '../controllers/plannerController'
import {verifyToken} from "../middleware/auth";
const router = express.Router();


router.get('/calendar',PlannerController.getPlannerData);
router.get('/history',PlannerController.getUserChallengeHistory);
router.get('/statistic',PlannerController.getUserStatistics);


export default router