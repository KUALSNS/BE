import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import {stream} from './modules/loggerHandler';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
const isoDate = new Date(date).toISOString().slice(0, 10) + "T00:00:00.000Z";
const realDate = new Date(isoDate);
console.log(realDate);

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