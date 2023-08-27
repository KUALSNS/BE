import schedule from 'node-schedule';
import { DATA_SOURCES } from '../config/auth.js';
import mysql from 'mysql2/promise';


export const challengeScheduler =  () => {
 
    schedule.scheduleJob('0 0 2 * * *', async function () {      
        const connection = await mysql.createConnection(DATA_SOURCES.development);
        await connection.connect();
    
        const challengeSelect = `UPDATE user_challenges SET complete = 1 WHERE DATE_ADD(finish_at, INTERVAL 1 DAY) = CURDATE(); `;
        await connection.query(challengeSelect);
        await connection.end();
      

      console.log('챌린지 종료 여부 스케줄러 확인 완료');
    })
}