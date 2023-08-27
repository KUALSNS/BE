import { type } from "os";



export interface userLoginRequestDto {
    userIdentifier: string;
    userPassword: string;
}

export interface UserLoginResponseDto {
    accessToken: string;
    refreshToken: string;
    role: string;
}

export interface UserReissueTokenResponseDto {
    accessToken: string;
    refreshToken: string;
}


export interface decoded {
    message: string;
    id: string;
    role: string;
}

export interface userSignupDto {
    userId: string;
    email: string;
    password: string;
    nickname: string;
    phoneNumber: string;
}

export interface userIdFindRequestDto {
    email: string;
    code: string;
}


export interface UserIdResponseDto {
    identifier: string;
}


export type redisCode = number;


export interface userPasswordFindRequestDto {
    identifier: string;
    userEmail: string;
}

export type passwordUpdate = string;


export interface checkIdentifierRequestDto {
    checkIdentifier: string;
}


export interface kakaoLogInResponseDto {
    accessToken: string,
    refreshToken: string,
    role: string
}


export interface signUpRequestDto {
    email: string;
    password: string;
    nickname: string;
    identifier: string;
    phoneNumber: string;
}


export interface sendEmailRequestDto  {
    email : string
}


export interface sendEmailReponseDto  {
    status : number;
    message : string;
    responseData : Object;
}

