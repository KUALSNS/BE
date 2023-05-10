import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    credentials : true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('combined'));

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

index.use('/api/user',require('./routers/userRouter'));
index.use('/api/challenge',require('./routers/challengeRouter'));
index.use('/api/profile',require('./routers/profileRouter'));


// const allowedOrigins = [
//     'http://localhost:3000',
//     'http://192.168.0.134:3000',
//     'http://192.168.0.123:3000',
//     'http://192.168.0.126:3000',
//     'http://192.168.0.128:3000',
//     'https://www.tarae.store',
//     'https://tarae.store',
//     'https://api.tarae.store',
//     'http://localhost:5173',
//     process.env.EC2URL,
// ];
const corsOptions = {
    origin: '*',
    credentials: true,
};




// @ts-ignore
// app.use((req, res, next) => {
//     const origin: string = req.headers.origin!;
//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
//     res.header(
//       'Access-Control-Allow-Headers',
//       'X-Requested-With, content-type, x-access-token',
//     );
//     next();
// });

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