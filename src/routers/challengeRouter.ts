import express from 'express';
import  * as ChallengeController  from '../controllers/challengeController'
import cors from 'cors';
const router = express.Router()

router.get('/', ChallengeController.beforeMain);
router.get('/whole-category', ChallengeController.wholeCategory);
router.get('/select', ChallengeController.manyCategory);
router.get('/search', ChallengeController.challengeSearch);
router.get('/:category', ChallengeController.oneCategory);



export = router