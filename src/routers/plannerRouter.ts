import express from 'express';
import * as PlannerController from '../controllers/plannerController'
import {verifyToken} from "../middleware/auth";
const router = express.Router();


router.get('/',PlannerController.getPlannerData);



export = router