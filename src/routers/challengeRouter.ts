import express from 'express';
import  * as ChallengeController  from '../controllers/challengeController'
import cors from 'cors';
const router = express.Router()

router.use(cors({
    credentials : true
}));

router.get('/',ChallengeController.beforeMain);
// router.get('/login/reissue-token',UserController.userReissueToken);
// router.patch('/logout',UserController.userLogout);

export = router