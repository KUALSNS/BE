import express from 'express';
import  * as ChallengeController  from '../controllers/challengeController'
import cors from 'cors';
const router = express.Router()

router.use(cors({
    credentials : true
}));

router.get('/', ChallengeController.beforeMain);
router.get('/whole-category', ChallengeController.wholeCategory);
router.get('/:category', ChallengeController.oneCategory);

export = router