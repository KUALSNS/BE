import express from 'express';
import detenv from 'dotenv';
import morgan from 'morgan';

detenv.config();
const index = express();
const port = process.env.PORT || 3000;

index.use(express.json());
index.use(express.urlencoded({extended: true}));
index.use(morgan('combined'));

index.use('/api/user',require('./routers/userRouter'));

index.get('/', (req, res) => {
    res.send('Hello World!');
});

index.use((req, res, next) => {
    const error  =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.message = '404';
    next(error);
});
index.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
