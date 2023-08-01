
import { JwtPayload } from 'jsonwebtoken';
interface decodedToken {
    id: number;
  }


declare global{

  namespace Express {
    export interface Request {
      decoded? :  decodedToken | JwtPayload;
    }
  }
}
