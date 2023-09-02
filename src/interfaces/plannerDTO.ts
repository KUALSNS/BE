

export type getUserChallengeTemplateRequestDto = {
    challenge : string;
}




export interface getUserChallengeTemplateResponseDto  {
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

