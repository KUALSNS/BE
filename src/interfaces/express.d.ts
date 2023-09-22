
import { JwtPayload } from 'jsonwebtoken';
interface decodedToken {
    id: number;
  }

  interface IFile {
    location: any;
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }

declare global{

  namespace Express {
    export interface Request {
      decoded? :  decodedToken | JwtPayload;
      files: IFile[];
    }
  }



}
