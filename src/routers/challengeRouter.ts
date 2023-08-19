import express from 'express';
import * as ChallengeController from '../controllers/challengeController'
import { verifyToken } from '../middleware/auth';




const router = express.Router();

router.get('/', ChallengeController.beforeMain);
router.post('/main', verifyToken, ChallengeController.afterMain);
router.get('/search', ChallengeController.challengeSearch)




export default router