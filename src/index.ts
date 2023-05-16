import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import {stream} from './modules/loggerHandler';
import {getKoreanDateISOString} from './modules/koreanTime';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;


  const koreanDateISOString = getKoreanDateISOString();
  const koreanTime = new Date(koreanDateISOString)
  console.log(koreanTime);




app.use(morgan('combined', { stream: stream }));
app.use(cors({
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use('/api/user', require('./routers/userRouter'));
app.use('/api/challenge', require('./routers/challengeRouter'));
app.use('/api/profile', require('./routers/profileRouter'));

app
    .listen(port, () => {
        console.log(`
    ################################################
          🛡️  Server listening on port: ${port} 🛡️
    ################################################
  `);
        console.info('Tarae Server Start');
    })
    .on('error', (err) => {
        console.error(err);
        process.exit(1);
    });