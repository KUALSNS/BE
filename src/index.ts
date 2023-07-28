import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import {stream} from './modules/loggerHandler';
import {getKoreanDateISOString, getKoreanDateISOStringAdd9Hours} from './modules/koreanTime';
dotenv.config();
const app = express();

const port1 = process.env.PORT1 || 3000;
//const port2 = process.env.PORT2 || 3001;

  const koreanDateISOString = getKoreanDateISOString();
  const koreanTime = new Date(koreanDateISOString)
  console.log(koreanTime);

  const koreanDateISOString2 = getKoreanDateISOStringAdd9Hours();
  const koreanTime2 = new Date(koreanDateISOString2)
  console.log(koreanTime2);


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
app.use('/api/planner', require('./routers/plannerRouter'));


app
    .listen(port1, () => {
        console.log(`
    ################################################
          🛡️  Server listening on port: ${port1} 🛡️
    ################################################
  `);
        console.info('Tarae Server Start');
    })
    .on('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    // app.listen(port2, () => {
    //     console.log(`
    //       ################################################
    //             🛡️  Server 2 listening on port: ${port2} 🛡️
    //       ################################################
    //     `);
    //   }).on('error', (err) => {
    //     console.error(err);
    //     process.exit(1);
    // });