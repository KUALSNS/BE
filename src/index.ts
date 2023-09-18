import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { stream, logger } from './modules/loggerHandler.js';
import challengeRouter from './routers/challengeRouter.js';
import userRouter from './routers/userRouter.js'; 
import profileRouter from './routers/profileRouter.js'
import plannerRouter from './routers/plannerRouter.js'; 
import writeRouter from './routers/writeRouter.js'; 
import { challengeScheduler } from './modules/challengeScheduler.js';


dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

app.use(morgan('combined', { stream }));
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.use('/api/user', userRouter);
app.use('/api/challenge', challengeRouter);
app.use('/api/profile', profileRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/write', writeRouter);

app.listen(port, () => {
  console.log(`
    ################################################
          🛡️  Server listening on port: ${port} 🛡️
    ################################################
  `);
  console.info('Writon Server Start');
  challengeScheduler();
})
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

