

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

export interface  userIdFindRequestDto {
    email : string;
    code : string;
}


export interface userIdDB {
    identifier: string;
}


export type redisCode = number;


export interface userPasswordFindRequestDto {
    identifier : string;
    userEmail  : string;
}

export interface userIdentifierDB {
    user_id: number;
}

export type passwordUpdate = string;

