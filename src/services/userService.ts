import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import mysql from 'mysql2/promise';
// const prisma = new PrismaClient()
// async function main() {
//   await prisma.user.create({
//     data: {
//       name: 'Alice',
//       email: 'alice@prisma.io',
//       posts: {
//         create: { title: 'Hello World' },
//       },
//       profile: {
//         create: { bio: 'I like turtles' },
//       },
//     },
//   })

//   const allUsers = await prisma.user.findMany({
//     include: {
//       posts: true,
//       profile: true,
//     },
//   })
//   console.dir(allUsers, { depth: null })
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })
  const userEmailSelect =  async (userEmail: string) => {
    const connection = await mysql.createConnection(DATA_SOURCES.development);
    try {
      await connection.connect();
      const  userSelect : string = `select user_id, role, password from users where identifier = '${String(userEmail)}'; `;
      const userSelectResult : any  = await connection.query(userSelect);
      return userSelectResult[0][0];
    } catch (error) {
      console.log(error);
    } finally {
      await connection.end();
    }
  }

  export  { userEmailSelect }

