
export type newChallengeRequestDto = {
    name: string;
};

interface challengingArray {
    challengeName: string;
    category: string;
}[]



type  challengeName =  string;
type  challengeCategory = string;
    
interface templates {
    templateTitle: string;
    templateContent: string;
    category: string;
    image: string;
}

export interface newChallengeResponseDto {
    code: number;
    message : string;
    data? : {
        challengingArray : challengingArray[];
        templateData : {
            challengeName : challengeName;
            challengeCategory : challengeCategory;
           templates : templates[];
        }
    }
}
