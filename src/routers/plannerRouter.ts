import express from 'express';
import * as PlannerController from '../controllers/plannerController'
const router = express.Router();


router.get('/', PlannerController.getPlanner);



export = router