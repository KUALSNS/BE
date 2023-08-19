import express from 'express';
import * as ProfileController  from '../controllers/profileController.js'
const router = express.Router()
import {passwordUpdate, profileUpdate, userChallengeStatistics} from '../controllers/profileController.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';

router.use(cors({
  credentials : true
}));

router.get('/', verifyToken, ProfileController.userProfile);
router.patch('/', verifyToken, ProfileController.profileUpdate);

router.get('/history', verifyToken, ProfileController.userChallengeStatistics);
router.patch('/password', verifyToken, ProfileController.passwordUpdate);
router.patch('/phone', verifyToken, ProfileController.profileUpdate);
router.patch('/email', verifyToken, ProfileController.emailUpdate);
// coupon activation router
router.post('/coupon', verifyToken, ProfileController.couponActivation);

export default router
