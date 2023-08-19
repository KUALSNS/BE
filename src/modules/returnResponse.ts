import { Response } from 'express';


class ErrorResponse {
    constructor(private code: number, private message: string) {}

    sendResponse(res: Response): Response {
        return res.status(this.code).json({
            code: this.code,
            message: this.message
        });
    }
}

class SuccessResponse {
    constructor(private code: number, private message: string, private data?: unknown) {}

    sendResponse(res: Response): Response {
        return res.status(this.code).json({
            code: this.code,
            message: this.message,
            data: this.data
        });
    }
}

export {
    ErrorResponse,
    SuccessResponse
}