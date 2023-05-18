import express from 'express';
import * as PlannerController from '../controllers/plannerController'
import {verifyToken} from "../middleware/auth";
const router = express.Router();


router.get('/calandar',PlannerController.getPlannerData);
router.get('/history',PlannerController.getUserChallengeHistory);



export = router