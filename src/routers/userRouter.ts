import express from 'express';
import  * as UserController  from '../controllers/userController'
import cors from 'cors';
const router = express.Router()

router.use(cors({
    credentials : true
}));

router.post('/login', UserController.userLogin);
router.get('/login/reissue-token',UserController.userReissueToken);
router.patch('/logout',UserController.userLogout);
//router.post('/signup',UserController.userSignup);

export = router
