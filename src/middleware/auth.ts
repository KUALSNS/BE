
import jwt from 'jsonwebtoken';
const secret = process.env.JSONSECRET!;

const sign =  (userId : string, userRole : number) => { 
    const payload = { 
      id: userId,
      role: userRole,
    };

    return jwt.sign(payload, secret, { 
      algorithm: 'HS256', 
      expiresIn: '1m', 	  
    });
  }

const refresh =  () => {
    return jwt.sign({}, secret, { 
      algorithm: 'HS256',
      expiresIn: '2m',
    });
  }




export  {sign, refresh}