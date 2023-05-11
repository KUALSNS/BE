import express from 'express';
import cors from 'cors';
const router = express.Router()
import * as ProfileController  from '../controllers/profileController'
import {passwordUpdate, profileUpdate} from '../controllers/profileController';

router.use(cors({
  credentials : true
}));

router.get('/', ProfileController.userProfile);
router.patch('/', ProfileController.profileUpdate);
router.get('/history', ProfileController.userHistory);
router.patch('/password', ProfileController.passwordUpdate);
router.patch('/phone', ProfileController.profileUpdate);
router.patch('/email', ProfileController.emailUpdate);

export = router
