
export type newChallengeRequestDto = {
    name: string;
};

export type selectTemplateRequestDto = {
    challengeName: string;
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

    challengingArray: challengingArray[];
    templateData: {
        challengeName: challengeName;
        challengeCategory: challengeCategory;
        templates: templates[];
    }

}

interface temporaryChallenge {
    title: string | null;
    writing: string;
}[];

interface challengingArray {
    challengeNames: {
        title: string;
        category: {
            name: string;
        };
    };
    category: string;
}[];

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
};

export interface writeChallengeResponseDto {
    templateCertain: boolean;
    temporaryChallenge: temporaryChallenge[];
    challengingArray: challengingArray[];
    templateData: templateData;
}

export type ChallengeCategoryDB = {
    chal_id: number;
    challenges: {
        title: string;
        category: {
            name: string;
        };
    };
    user_challenge_templetes: {
        uctem_id: number;
    }[];
};

export type ChallengeIdCategory = {
    chal_id: number;
    category: {
        name: string;
        emogi: string;
    };
}[]

export type ChallengeId = {
    uchal_id: number;
}[]


export interface selectTemplateResponseDto {
    templateCertain: boolean;
    temporaryChallenge: {
        title: string | null;
        writing: string;
        userChallenge: string;
    }[];
    challengingArray: {
        challengeName: string;
        category: string;
    }[];
    templateData: {
        challengeName: string;
        challengeCategory: string;
        templates: {
            templateTitle: string;
            templateContent: string;
            category: string | undefined;
            image: string | undefined;
        }[];
    }
}


export interface insertChallengeRequestDto {
    challengeName: string;
    challengeTitle: string;
    challengeContent: string;
}










