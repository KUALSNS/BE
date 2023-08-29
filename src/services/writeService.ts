import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth.js';
import { TemplateDTO } from '../interfaces/DTO.js';
import mysql from 'mysql2/promise';
import { getKoreanDateISOString, getKoreanDateISOStringAdd9Hours } from '../modules/koreanTime.js';
import { ChallengeCategoryDB, ChallengeId, ChallengeIdCategory } from '../interfaces/writeDTO.js';
const prisma = new PrismaClient();
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 유저의 챌린지 수 조회 함수
 * @param user_id  유저 아이디
 * @returns 유저의 챌린지 수
 */
const userChallengingCountData = async (user_id: number) => {
    try {
        const challengesCountDB = await prisma.user_challenges.aggregate({
            where: {
                user_id: user_id,
                complete: false
            },
            _count: {
                uchal_id: true
            }
        });

        prisma.$disconnect();
        return challengesCountDB;
    } catch (error) {
        prisma.$disconnect();
        console.log(error);
        throw new Error(`Failed ${__dirname} newChallengeData function`);
    }
};



/**
 * 챌린지 이름에 따른 챌린지 id 조회 함수
 * @param newChallenge 챌린지 이름
 * @returns  해당 챌린지의 id
 */
const selectChallengeData = async (challengeName: string) => {
    try {

        const chalId = await prisma.challenges.findMany({
            where: {
                title: challengeName
            },
            select: {
                chal_id: true,
                category: {
                    select: {
                        name: true,
                        emogi: true
                    }
                }
            }
        });

        prisma.$disconnect();
        return chalId;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} selectChallenge function`);
    }
};

/**
 *  유저의 챌린지 시작 db 적용 함수
 * @param user_id 유저 id
 * @param chalId 챌린지 id
 * @returns 
 */
const startChallengeData = async (user_id: number, chalId: number) => {
    try {
        const koreanDate = getKoreanDateISOStringAdd9Hours();
        const koreanTime = new Date(koreanDate)
        console.log(koreanTime);


        await prisma.user_challenges.create({
            data: {
                user_id: user_id,
                chal_id: chalId,
                finish_at: koreanTime
            }
        });
        prisma.$disconnect();
        return;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} startChallengeData function`);
    }
};

/**
 * 유저의 해당 챌린지가 진행 중인지 판단 함수
 * @param userId 유저 id
 * @param chalId 챌린지 id
 * @returns  해당 조회 데이터
 */
const userChallengeSelectData = async (userId: number, chalId: number) => {
    try {

        const userChallengeIdDB = await prisma.user_challenges.findMany({
            where: {
                chal_id: chalId,
                user_id: userId,
                complete: false
            },
            select: {
                uchal_id: true
            }
        });

        prisma.$disconnect();
        return userChallengeIdDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} userChallengeSelect function`);
    }
};

/**
 * @param challenge_id  챌린지 id
 * @returns  챌린지 템플릿 데이터
 */
const templateData = async (challengeId: number) => {
    try {

        const challengTemplateDB = await prisma.challenges.findMany({
            where: {
                chal_id: challengeId
            },
            select: {
                title: true,
                category: {
                    select: {
                        name: true,
                        emogi: true
                    },
                },
                templates: {
                    select: {
                        title: true,
                        content: true
                    }
                }
            }
        });

        prisma.$disconnect();
        return challengTemplateDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} templateData function`);
    }
};



/**
 * @param user_id       유저 id
 * @returns 유저가 진행 중인 챌린지의 데이터, 오늘 완료하지 못한 템플릿  
 */
const userChallengeAndTodayTemplateNotCompleteData = async (userId: number) => {
    try {
        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate);

        const templateNotCompleteDB = await prisma.user_challenges.findMany({
            where: {
                user_id: userId,
                complete: false
            },
            select: {
                chal_id: true,
                challenges: {
                    select: {
                        title: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                user_challenge_templetes: {
                    where: {
                        created_at: koreanTime,
                        NOT: {
                            complete: true,
                        }
                    },
                    select: {
                        uctem_id: true
                    }
                }
            }
        });

        prisma.$disconnect();
        return templateNotCompleteDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} userChallengeAndTodayTemplateNotCompleteData function`);
    }
};



/**
 * @param user_id       유저 id
 * @returns  유저가 진행 중인 챌린지의 데이터, 오늘 완료한 템플릿  
 */
const userChallengeAndTodayTemplateCompleteData = async (userId: number) => {
    try {
        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate);

        const templateCompleteDB = await prisma.user_challenges.findMany({
            where: {
                user_id: userId,
                complete: false
            },
            select: {
                chal_id: true,
                challenges: {
                    select: {
                        title: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                user_challenge_templetes: {
                    where: {
                        created_at: koreanTime,
                    },
                    select: {
                        uctem_id: true
                    }
                }
            }
        });

        prisma.$disconnect();
        return templateCompleteDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} userChallengeAndTodayTemplateCompleteData  function`);
    }
};




/**
 * @param uctem_id  유저 챌린지 템플릿 id
 * @returns 
 */
const templateAndUserChallengeData = async (uctem_id: number) => {
    try {

        const templateAndUserChallengeDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uctem_id: uctem_id
            },
            select: {
                title: true,
                writing: true,
                user_challenges: {
                    select: {
                        challenges: {
                            select: {
                                title: true

                            }
                        }
                    }
                }
            }
        });

        prisma.$disconnect();
        return templateAndUserChallengeDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} writeTemplateData function`);
    }
};

/**
 * @param chal_id   챌린지 id
 * @returns  챌린지에 따른 템플릿 데이터
 */
const templateAndCategoryData = async (chal_id: number) => {
    try {

        const templateAndCategoryDB = await prisma.templates.findMany({
            where: {
               chal_id: chal_id
            },
            select: {
                title: true,
                content: true,
                challenges: {
                    select: {
                        category: {
                            select: {
                                name: true,
                                emogi: true
                            }
                        }
                    }
                }
            }
        });

        prisma.$disconnect();
        return templateAndCategoryDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} templateCategoryData function`);
    }
};

/**
 * @param chal_id   챌린지 id
 * @param uctem_id  유저 챌린지 템플릿 id
 * @returns 
 */
const categoryNameData = async (chal_id: number) => {
    try {

        const categoryNameDB = await prisma.challenges.findMany({
            where: {
                chal_id: chal_id
            },
            select: {
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        prisma.$disconnect();
        return categoryNameDB;

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} categoryNameData function`);
    }
};

/**
 * 챌린지 템플릿 내용 업데이트 함수
 * @param complete           챌린지 템플릿 완료 여부 
 * @param userChallengeId    유저 챌린지 id
 * @param challengeTitle     템플릿 제목
 * @param challengeContent   템플릿 내용
 * @returns 
 */
const updateTimeChallengeTemplateData = async (
    complete: boolean,
    userChallengeId: number,
    challengeTitle: string,
    challengeContent: string
) => {
    try {

        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate)
        await prisma.user_challenge_templetes.updateMany({
            where: {
                uchal_id: userChallengeId,
                created_at: koreanTime


            },
            data: {
                title: challengeTitle,
                writing: challengeContent,
                complete: complete
            }
        });
        prisma.$disconnect();
        return;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} updateChallengeTemplateData function`);
    }
};


const specialTemplateData = async (challengeId: number) => {
    try {

        const templateDB : TemplateDTO[] = await prisma.templates.findMany({
                where: {
                    chal_id: challengeId,
                },
                select: {
                    title: true,
                    content: true
                }
            });
        

        prisma.$disconnect();
        return templateDB;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} specialTemplateData function`);
    }
};

/**
 *  템플릿 수정 함수( 오늘 챌린지 완료 여부 x)
 * @param userChallengeId    유저 챌린지 id
 * @param challengeTitle     템플릿 제목
 * @param challengeContent   템플릿 내용
 * @returns 
 */
const updateNoTimeChallengeTemplateData = async (
    userChallengeId: number,
    challengeTitle: string,
    challengeContent: string
) => {
    try {
        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate)
        await prisma.user_challenge_templetes.updateMany({
            where: {
                uchal_id: userChallengeId,
                created_at: koreanTime
            },
            data: {
                title: challengeTitle,
                writing: challengeContent,
            }
        });
        prisma.$disconnect();
        return;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} updatePlannerChallengeTemplateData function`);
    }
};
/**
 * 오늘 챌린지 템플릿 추가 함수 
 * @param complete           챌린지 템플릿 완료 여부 
 * @param userChallengeId    유저 챌린지 id
 * @param challengeTitle     템플릿 제목
 * @param challengeContent   템플릿 내용
 * @returns 
 */
const insertChallengeTemplateData = async (
    complete: boolean,
    userChallengeId: number,
    challengeTitle: string,
    challengeContent: string
) => {
    try {
        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate)

        await prisma.user_challenge_templetes.create({
            data: {
                uchal_id: userChallengeId,
                title: challengeTitle,
                writing: challengeContent,
                complete: complete,
                finish_at: koreanTime
            }
        });

        prisma.$disconnect();
        return;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} insertChallengeCompleteData function`);
    }
};

/**
 * 오늘 진행할 챌린지 중 챌린지 템플릿이 있는지 조회 함수
 * @param userChallengeId 유저 챌린지 id
 * @returns 
 */
const selectTodayChallengeTemplateData = async (userChallengeId: number) => {
    try {

        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate);

        const selectTodayChallengeTemplateDB = await prisma.user_challenge_templetes.findFirst({
            where: {
                uchal_id: userChallengeId,
                created_at: koreanTime
            },
            select: {
                uctem_id: true
            }
        });

        prisma.$disconnect();
        return selectTodayChallengeTemplateDB;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} selectTodayChallengeTemplateData function`);
    }
};

/**
 * 챌린지 템플릿 정보와 유저가 진행 중인 유저 챌린지 id 조회 함수
 * @param challengeIdCategory 챌린지 id 카테고리 정보
 * @param user_id  유저 id
 * @returns 
 */


/**
 * 유저가 진행 중인, 오늘 진행해야할 챌린지 조회 함수
 * @param challengeId 챌린지 id
 * @returns 
 */
const challengingData = async (userChallengeId: number) => {
    try {

        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate);

        const challengingDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: userChallengeId,
                created_at: koreanTime,
                complete: false
            },
            select: {
                title: true,
                writing: true,
                user_challenges: {
                    select: {
                        challenges: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        });

        prisma.$disconnect();
        return challengingDB;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${__dirname} challengingData function`);
    }
};







export {
    userChallengingCountData, selectChallengeData, templateData, userChallengeAndTodayTemplateNotCompleteData,
    userChallengeAndTodayTemplateCompleteData, startChallengeData, templateAndUserChallengeData,
    templateAndCategoryData, categoryNameData, updateTimeChallengeTemplateData, specialTemplateData,
    insertChallengeTemplateData, challengingData, userChallengeSelectData,
    selectTodayChallengeTemplateData, updateNoTimeChallengeTemplateData
}