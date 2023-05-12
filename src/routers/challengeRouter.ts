import express from 'express';
import  * as ChallengeController  from '../controllers/challengeController'
import  * as WriteController  from '../controllers/writeController'
import  {verifyToken} from '../middleware/auth';



const router = express.Router();

router.get('/', ChallengeController.beforeMain);
router.post('/start/:name', verifyToken, WriteController.newChallenge);
router.get('/main', verifyToken ,ChallengeController.afterMain);
router.get('/whole-category', ChallengeController.wholeCategory);
router.get('/select', ChallengeController.manyCategory);
router.get('/search', ChallengeController.challengeSearch);
router.get('/:category', ChallengeController.oneCategory);



export = router