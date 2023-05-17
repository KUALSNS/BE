import express from 'express';
import * as ChallengeController from '../controllers/challengeController'
import * as WriteController from '../controllers/writeController'
import { verifyToken } from '../middleware/auth';
import { uploadImage, uploadVideo } from '../modules/s3Uploader';



const router = express.Router();

router.get('/', ChallengeController.beforeMain);

router.get('/write', verifyToken, WriteController.writeChallenge);
router.post('/write/picture-upload', uploadImage.array('image'), WriteController.uploadImage);
router.post('/write/video-upload', uploadVideo.array('video'), WriteController.uploadVideo);
router.post('/start/:name', verifyToken, WriteController.newChallenge);
router.get('/main', verifyToken, ChallengeController.afterMain);
router.get('/whole-category', ChallengeController.wholeCategory);
router.get('/select', ChallengeController.manyCategory);
router.get('/search', ChallengeController.challengeSearch)
router.get('/:category', ChallengeController.oneCategory);
router.get('/write/:challengeName', verifyToken, WriteController.selectTemplate);
router.post('/write/temporary-storage', verifyToken, WriteController.insertTemporaryChallenge);
router.post('/write/register', verifyToken, WriteController.insertChallengeComplete);



export = router