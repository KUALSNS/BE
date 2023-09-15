import express from 'express';
import * as WriteController from '../controllers/writeController.js'
import { verifyToken } from '../middleware/auth.js';




const router = express.Router();


router.post('/', verifyToken, WriteController.writeChallenge);
router.get('/start/:name', verifyToken, WriteController.newChallenge);
router.get('/:challengeName', verifyToken, WriteController.selectTemplate);
router.post('/planner/temporary-storage', verifyToken, WriteController.plannerTemporaryChallenge);
router.post('/temporary-storage', verifyToken, WriteController.insertTemporaryChallenge);
router.post('/register', verifyToken, WriteController.insertChallengeComplete);



export default router