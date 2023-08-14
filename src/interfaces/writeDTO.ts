
export type newChallengeRequestDto = {
    name: string;
};

interface challengingArray {
    challengeName: string;
    category: string;
}[]



type challengeName = string;
type challengeCategory = string;

interface templates {
    templateTitle: string;
    templateContent: string;
    category: string;
    image: string;
}

export interface newChallengeResponseDto {
    code: number;
    message: string;
    data?: {
        challengingArray: challengingArray[];
        templateData: {
            challengeName: challengeName;
            challengeCategory: challengeCategory;
            templates: templates[];
        }
    }
}

interface temporaryChallenge {
    title: string | null;
    writing: string;
}[]


interface challengingArray {
    challengeNames: {
        title: string;
        category: {
            name: string;
        };
    };
    category: string;
}[]


interface templateData {
    challengeName: {
        title: string;
        category: {
            name: string;
        };
    };
    challengeCategory: string;
    templates: {
        templateTitle: string;
        templateContent: string;
        category: string;
        image: string;
    }[];
}

export interface writeChallengeResponseDto {
    templateCertain: boolean;
    temporaryChallenge: temporaryChallenge[];
    challengingArray : challengingArray[];
    templateData : templateData;
}
