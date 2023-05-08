import express from 'express';
import cors from 'cors';
const router = express.Router()
import * as ProfileController  from '../controllers/profileController'
import { profileUpdate } from '../controllers/profileController';

router.use(cors({
  credentials : true
}));

router.get('/profile', ProfileController.userProfile);
router.patch('/profile/nickname', ProfileController.profileUpdate);
router.patch('/profile/phone', ProfileController.profileUpdate);
router.patch('/profile/email', ProfileController.profileUpdate);
export = router
