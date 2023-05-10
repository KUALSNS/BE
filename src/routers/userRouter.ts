import express from 'express';
import  * as UserController  from '../controllers/userController'
const router = express.Router()

router.post('/login', UserController.userLogin);
router.get('/login/reissue-token',UserController.userReissueToken);
router.patch('/logout',UserController.userLogout);
router.post('/signup/verify-email',UserController.verifyEmail);
router.get('/signup/verify-email-code',UserController.sendEmail);
router.post('/signup',UserController.userSignup);
export = router
