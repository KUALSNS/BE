import express from 'express';
import  * as UserController  from '../controllers/userController'
const router = express.Router()


router.post('/login', UserController.userLogin);
router.get('/login/reissue-token',UserController.userReissueToken);
router.patch('/logout',UserController.userLogout);

export = router