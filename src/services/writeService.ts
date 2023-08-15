import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import { TemplateDTO } from '../interfaces/DTO';
import mysql from 'mysql2/promise';
import path from 'path';
import { getKoreanDateISOString, getKoreanDateISOStringAdd9Hours } from '../modules/koreanTime';
import { ChallengeCategoryDB, ChallengeId, ChallengeIdCategory } from '../interfaces/writeDTO';
const prisma = new PrismaClient();


/**
 * 유저의 쿠폰 여부와 유저의 챌린지 수 조회 함수
 * @param user_id  유저 아이디
 * @returns 유저의 쿠폰 여부와 유저의 챌린지 수
 */
const newChallengeData = async (user_id: number) => {
    try {
        const [userCooponDB, challengesCountDB] = await Promise.all([
            prisma.users.findUnique({
                where: {
                    user_id: user_id
                },
                select: {
                    coopon: true
                }
            }),
            prisma.user_challenges.aggregate({
                where: {
                    user_id: user_id
                },
                _count: {
                    uchal_id: true
                }
            }),
        ]);

        prisma.$disconnect();
        return {
            userCooponDB,
            challengesCountDB,
        }

    } catch (error) {
        prisma.$disconnect();
        console.log(error);
        throw new Error(`Failed ${path.resolve(__dirname)} newChallengeData function`);
    }
};

/**
 * 챌린지 이름에 따른 챌린지 id 조회 함수
 * @param newChallenge 챌린지 이름
 * @returns  해당 챌린지의 id
 */
const selectChallenge = async (newChallenge: string) => {
    try {

        const chalId = await prisma.challenges.findMany({
            where: {
                title: newChallenge
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
        throw new Error(`Failed ${path.resolve(__dirname)} selectChallenge function`);
    }
};

/**
 *  유저의 챌린지 시작 db 적용 함수
 * @param user_id 유저 id
 * @param chalId 챌린지 id
 * @returns 
 */
const startChallenge = async (user_id: number, chalId: number) => {
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
        throw new Error(`Failed ${path.resolve(__dirname)} startChallenge function`);
    }
};

/**
 * 유저의 해당 챌린지가 진행 중인지 판단 함수
 * @param userId 유저 id
 * @param chalId 챌린지 id
 * @returns  해당 조회 데이터
 */
const userChallengeSelect = async (userId: number, chalId: number) => {
    try {

        const result = await prisma.user_challenges.findMany({
            where: {
                chal_id: chalId,
                user_id: userId
            },
            select: {
                uchal_id: true
            }
        })

        prisma.$disconnect();
        return result[0];

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${path.resolve(__dirname)} userChallengeSelect function`);
    }
};

/**
 * 챌린지 시작 시 글쓰기 랜더링 시 필요한 데이터 조회 함수
 * @param user_id       유저 id
 * @param challenge_id  챌린지 id
 * @returns  챌린지 템플릿, 유저의 진행 챌린지 데이터
 */
const newChallengeResult = async (user_id: number, challenge_id: number) => {
    try {
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString)
        console.log(koreanTime);

        const [challengTemplateDB, relativeChallengeDBFirst, relativeChallengeDBSecond] = await Promise.all([
            prisma.challenges.findMany({
                where: {
                    chal_id: challenge_id
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
            }),
            prisma.user_challenges.findMany({
                where: {
                    user_id: user_id
                },
                select: {
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
            }),
            prisma.user_challenges.findMany({
                where: {
                    user_id: user_id
                },
                select: {
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
            }),
        ]);
        prisma.$disconnect();
        return {
            challengTemplateDB,
            relativeChallengeDBFirst,
            relativeChallengeDBSecond
        };
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${path.resolve(__dirname)} newChallengeResult function`);
    }
};


const writeChallengeData = async (user_id: number) => {
    try {
        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate)

        const [challengeCategoryDBFirst, challengeCategoryDBSecond] = await Promise.all([
            prisma.user_challenges.findMany({
                where: {
                    user_id: user_id
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
            }),
            prisma.user_challenges.findMany({
                where: {
                    user_id: user_id
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
            }),
        ]);
        prisma.$disconnect();
        return {
            challengeCategoryDBFirst,
            challengeCategoryDBSecond
        }
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${path.resolve(__dirname)} writeChallengeData function`);
    }
};

const writeTemplateData = async (chal_id: number, uctem_id?: number) => {
    try {

        if (!uctem_id) {

            const temporaryChallenge: string[] = []
            const [challengeTemplateDB, categoryDB] = await Promise.all([
                prisma.templates.findMany({
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
                }),
                prisma.challenges.findMany({
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
                }),
            ]);
            prisma.$disconnect();
            return { challengeTemplateDB, categoryDB, temporaryChallenge };
        }
        else {
            const [challengeTemplateDB, categoryDB, temporaryChallengeDB] = await Promise.all([
                prisma.templates.findMany({
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
                }),
                prisma.challenges.findMany({
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
                }),
                prisma.user_challenge_templetes.findMany({
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
                }),
            ]);

            prisma.$disconnect();
            return { challengeTemplateDB, categoryDB, temporaryChallengeDB };
        }
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${path.resolve(__dirname)} writeTemplateData function`);
    }
};

const insertTemporaryChallengeData = async (
    user_id: number,
    challengeName: string,
    templateName: string,
    challengeTitle: string,
    challengeContent: string
) => {
    try {
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString)
        console.log(koreanTime);

        const [challengeIdDB, templateIdDB] = await Promise.all([
            prisma.challenges.findMany({
                where: {
                    title: challengeName
                },
                select: {
                    chal_id: true
                }
            }),
            prisma.templates.findMany({
                where: {
                    title: templateName
                },
                select: {
                    tem_id: true
                }
            })
        ]);
        const userChallengeDB =
            await prisma.user_challenges.findMany({
                where: {
                    user_id: user_id,
                    chal_id: challengeIdDB[0].chal_id
                },
                select: {
                    uchal_id: true
                }
            });
        const challengeSignDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: userChallengeDB[0].uchal_id,
                //      tem_id: templateIdDB[0].tem_id,
                created_at: koreanTime,
            },
            select: {
                uctem_id: true
            }
        });
        console.log(challengeSignDB)

        if (challengeSignDB[0] == undefined) {
            await prisma.user_challenge_templetes.create({
                data: {
                    uchal_id: userChallengeDB[0].uchal_id,
                    //           tem_id: templateIdDB[0].tem_id,
                    title: challengeTitle,
                    writing: challengeContent,
                    complete: false
                }
            });

        } else {
            await prisma.user_challenge_templetes.updateMany({
                where: {
                    uchal_id: userChallengeDB[0].uchal_id,
                    //            tem_id: templateIdDB[0].tem_id,
                    created_at: koreanTime,
                },
                data: {
                    title: challengeTitle,
                    writing: challengeContent
                }
            });

        }
        prisma.$disconnect();
        return true;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        return false;
    }
};

const insertChallengeCompleteData = async (
    user_id: number,
    challengeName: string,
    challengeTitle: string,
    challengeContent: string
) => {
    try {
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString)
        console.log(koreanTime);

        const challengeIdDB = await Promise.all([
            prisma.challenges.findMany({
                where: {
                    title: challengeName
                },
                select: {
                    chal_id: true
                }
            }),

        ]);

        const userChallengeDB =
            await prisma.user_challenges.findMany({
                where: {
                    user_id: user_id,
                },
                select: {
                    uchal_id: true
                }
            });

        const challengeSignDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: userChallengeDB[0].uchal_id,
                created_at: koreanTime,
            },
            select: {
                uctem_id: true
            }
        });
        console.log(!challengeSignDB)

        if (challengeSignDB[0] == undefined) {
            console.log(1);
            await prisma.user_challenge_templetes.create({
                data: {
                    uchal_id: userChallengeDB[0].uchal_id,
                    //              tem_id: templateIdDB[0].tem_id,
                    title: challengeTitle,
                    writing: challengeContent,
                    complete: true,
                    finish_at: koreanTime
                }
            });

        } else {
            await prisma.user_challenge_templetes.updateMany({
                where: {
                    uchal_id: userChallengeDB[0].uchal_id,
                    //                tem_id: templateIdDB[0].tem_id,
                    created_at: koreanTime,
                },
                data: {
                    title: challengeTitle,
                    writing: challengeContent,
                    complete: true,
                    finish_at: koreanTime
                }
            });

        }
        prisma.$disconnect();
        return true;
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        return false;
    }
};

const selectTemplateData = async (
    challengeIdCategory: ChallengeIdCategory,
    user_id: number,
): Promise<{
    templateNameDB: TemplateDTO[];
    challengeIdDB: ChallengeId
}> => {
    try {

        const [templateNameDB, challengeIdDB] = await Promise.all([
            prisma.templates.findMany({
                where: {
                    chal_id: challengeIdCategory[0].chal_id,
                },
                select: {
                    title: true,
                    content: true
                }
            }),
            prisma.user_challenges.findMany({
                where: {
                    chal_id: challengeIdCategory[0].chal_id,
                    user_id: user_id
                },
                select: {
                    uchal_id: true
                }
            })
        ]);

        prisma.$disconnect();
        return { templateNameDB, challengeIdDB };
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        throw new Error(`Failed ${path.resolve(__dirname)} selectTemplateData function`);
    }
};


const challengingData = async (challengeId: number) => {
    try {

        const koreanDate = getKoreanDateISOString();
        const koreanTime = new Date(koreanDate);

        const challengingDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: challengeId,
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
        throw new Error(`Failed ${path.resolve(__dirname)} challengingData function`);
    }
};













export {
    newChallengeData, selectChallenge, newChallengeResult, startChallenge,
    writeChallengeData, writeTemplateData, insertTemporaryChallengeData,
    insertChallengeCompleteData, challengingData, selectTemplateData, userChallengeSelect
}