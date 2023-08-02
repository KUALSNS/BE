

export interface userReissueTokenRequestDto {
    access: string;

}

export interface userLoginRequestDto {
    userIdentifier: string;
    userPassword: string;

}

export interface refreshResultDB {
    state: boolean;
}

export interface decoded{
    message: string;
    id: string;
    role: number;
}



export interface userSignupDto {
    userId: string;
    email: string;
    password: string;
    nickname: string;
    phoneNumber: string;
}



