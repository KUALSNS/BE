import express from 'express';
import * as ProfileController  from '../controllers/profileController'
import { verifyToken } from '../middleware/auth';
const router = express.Router()

router.get('/', verifyToken, ProfileController.userProfile);
router.patch('/', ProfileController.profileUpdate);
router.get('/history', verifyToken, ProfileController.userChallengeStatistics);
router.patch('/password', verifyToken, ProfileController.passwordUpdate);
router.patch('/phone', verifyToken, ProfileController.profileUpdate);
router.patch('/email', verifyToken, ProfileController.emailUpdate);

export = router
