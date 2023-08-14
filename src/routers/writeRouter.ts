import express from 'express';
import * as WriteController from '../controllers/writeController'
import { verifyToken } from '../middleware/auth';




const router = express.Router();


router.post('/', verifyToken, WriteController.writeChallenge);
router.get('/start/:name', verifyToken, WriteController.newChallenge);
//router.get('/:challengeName', verifyToken, WriteController.selectTemplate);
router.post('/temporary-storage', verifyToken, WriteController.insertTemporaryChallenge);
router.post('/register', verifyToken, WriteController.insertChallengeComplete);



export default router