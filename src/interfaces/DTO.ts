export interface userLoginDto {
  userIdentifier: string;
  userPassword: string;

}

export interface userSignupDto {
  userId: string;
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
}

export interface TemplateDTO {
  title: string,
  content: string,
  category?: string;
  image?: string;
}

export interface mainChallengeDTO {
  title: string;
  category: string;

}

export type imagesArrayDTO = {
  originalname: string;
  location: string;
}[];

export type videoArrayDTO = {
  originalname: string;
  location: string;
}[];



