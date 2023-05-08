import express from 'express';
import cors from 'cors';
const router = express.Router()
import * as ProfileController  from '../controllers/profileController'

router.use(cors({
  credentials : true
}));

router.get('/profile', ProfileController.userProfile);
export = router
