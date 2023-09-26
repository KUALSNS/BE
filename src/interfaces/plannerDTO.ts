

export type getUserChallengeTemplateRequestDto = {
    challenge: string;
}




export interface getUserChallengeTemplateResponseDto {
    category : string;
    emogi : string;
    template : getUserChallengeTemplate;
   
}

interface getUserChallengeTemplate {
    title: string;
    created_at: Date;
    writing: string;
}[]

export interface getUserChallengeResponseDto {
    complete: boolean | null;
    start_at: string;
    finish_at: string;
    challengeTitle: string;
    categoryName: string;
}[]

export type userChallengeDto = {
    complete: boolean | null;
    remain_day: number | null;
    challengeTitle: string;
    categoryName: string;
}[]