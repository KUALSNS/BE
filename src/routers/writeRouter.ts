import express from 'express';
import * as ChallengeController from '../controllers/challengeController'
import * as WriteController from '../controllers/writeController'
import { verifyToken } from '../middleware/auth';




const router = express.Router();


router.post('/write', verifyToken, WriteController.writeChallenge);
router.get('/start/:name', verifyToken, WriteController.newChallenge);
router.get('/write/:challengeName', verifyToken, WriteController.selectTemplate);
router.post('/write/temporary-storage', verifyToken, WriteController.insertTemporaryChallenge);
router.post('/write/register', verifyToken, WriteController.insertChallengeComplete);



export default router