import { PrismaClient } from '@prisma/client'
import { DATA_SOURCES } from '../config/auth';
import { TemplateDTO } from '../interfaces/DTO';
import mysql from 'mysql2/promise';
import { getKoreanDateISOString, getKoreanDateISOStringAdd9Hours } from '../modules/koreanTime';
const prisma = new PrismaClient();




const newChallengeData = async (user_id: number, newChallenge: string) => {
    try {
        const [userCooponDB, challengesCountDB, challengesOverlapDB] = await Promise.all([
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
            prisma.challenges.findMany({
                where: {
                    title: newChallenge
                },
                select: {
                    user_challenges: {
                        where: {
                            user_id: user_id
                        },
                        select: {
                            chal_id: true
                        }
                    }
                }
            })
        ]);
        const coopon = userCooponDB?.coopon;
        const challengesCount = challengesCountDB._count.uchal_id;
        const challengesOverlap = challengesOverlapDB[0].user_challenges[0];
        prisma.$disconnect();
        return {
            coopon,
            challengesCount,
            challengesOverlap
        }

    } catch (error) {
        prisma.$disconnect();
        console.log(error);
    }
};

const startChallengeData = async (user_id: number, newChallenge: string) => {
    try {
        const koreanDateISOStringAdd9Hours = getKoreanDateISOStringAdd9Hours();
        const koreanTimeAdd9Hours = new Date(koreanDateISOStringAdd9Hours)
        console.log(koreanTimeAdd9Hours);
        const chalId = await prisma.challenges.findMany({
            where: {
                title: newChallenge
            },
            select: {
                chal_id: true
            }
        });
        const chalIdData = chalId[0].chal_id;
        await prisma.user_challenges.create({
            data: {
                user_id: user_id,
                chal_id: chalIdData,
                finish_at: koreanTimeAdd9Hours
            }
        });
        prisma.$disconnect();
        return { chalIdData, newChallenge };

    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        return false;
    }
};

const newChallengeResult = async (user_id: number, challenge_id: number, newChallenge: string) => {
    try {
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString)
        console.log(koreanTime);

        const challengTemplateArray: {
            category: string;
            "templateTitle": string;
            "templateContent": string;
        }[] = [];
        const relativeChallengeArray = [];

        const [challengTemplateDB, relativeChallengeDB1, relativeChallengeDB2] = await Promise.all([
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

        for (var i = 0; i < challengTemplateDB[0].templates.length; i++) {
            const challengTemplate = challengTemplateDB.map((e) => {
                return [{
                    "templateTitle": e.templates[i].title,
                    "templateContent": e.templates[i].content,
                    "category": e.category.name,
                    "image": e.category.emogi
                }]
            });
            challengTemplateArray.push(challengTemplate[0][0]);
        }
        for (var i = 0; i < relativeChallengeDB1.length; i++) {
            if (!relativeChallengeDB1[i].user_challenge_templetes[0]) {
            } else {
                const relativeChallengeMap = relativeChallengeDB1.map((e) => {
                    return { "challengeName": e.challenges.title, "category": e.challenges.category.name };
                });
                relativeChallengeArray.push(relativeChallengeMap[i]);
            }
        }

        for (var i = 0; i < relativeChallengeDB2.length; i++) {
            if (!relativeChallengeDB2[i].user_challenge_templetes[0]) {
                const relativeChallengeMap = relativeChallengeDB1.map((e) => {
                    return { "challengeName": e.challenges.title, "category": e.challenges.category.name };
                });
                if (relativeChallengeArray.indexOf(relativeChallengeMap[i]) === -1) {
                    relativeChallengeArray.push(relativeChallengeMap[i]);
                }
            }
        }
        const userChallenging = [
            ...relativeChallengeArray.filter(item => item.challengeName === newChallenge),
            ...relativeChallengeArray.filter(item => item.challengeName !== newChallenge)
        ];
        prisma.$disconnect();
        return {
            userChallenging,
            challengTemplateArray
        };
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
    }
};


const writeChallengeData = async (user_id: number) => {
    try {
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString)
        console.log(koreanTime);

        const challengeArray = [];
        const [challengeCategoryDB1, challengeCategoryDB2] = await Promise.all([
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
        for (var i = 0; i < challengeCategoryDB1.length; i++) {
            if (!challengeCategoryDB1[i].user_challenge_templetes[0]) {
            } else {
                challengeArray.push(challengeCategoryDB1[i]);
            }
        }
        for (var i = 0; i < challengeCategoryDB2.length; i++) {
            if (!challengeCategoryDB2[i].user_challenge_templetes[0]) {
                if (challengeArray.indexOf(challengeCategoryDB2[i]) === -1) {
                    challengeArray.push(challengeCategoryDB2[i]);
                }
            }
        }

        prisma.$disconnect();
        return { challengeArray }
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
    }
};

const writeTemplateData = async (chal_id: number, uctem_id?: number) => {
    try {
        if (!uctem_id) {
            console.log(1);
            const temporaryChallenge: string[] = []
            var [challengeTemplateDB, categoryDB] = await Promise.all([
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
            var [challengeTemplateDB, categoryDB, userTemplateDB] = await Promise.all([
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
                        // templates: {
                        //     select: {
                        //         title: true
                        //     }
                        // },
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
            const userTemplate = userTemplateDB.map((e) => {
                return {
                    "title": e.title,
                    "writing": e.writing,
            //        "templates": e.templates.title,
                    "user_challenges": e.user_challenges.challenges.title
                }

            })

            const temporaryChallenge = userTemplate;
            prisma.$disconnect();
            return { challengeTemplateDB, categoryDB, temporaryChallenge };
        }
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
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
       //         tem_id: templateIdDB[0].tem_id,
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
        //            tem_id: templateIdDB[0].tem_id,
                    title: challengeTitle,
                    writing: challengeContent,
                    complete: false
                }
            });

        } else {
            await prisma.user_challenge_templetes.updateMany({
                where: {
                    uchal_id: userChallengeDB[0].uchal_id,
            //        tem_id: templateIdDB[0].tem_id,
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
     //           tem_id: templateIdDB[0].tem_id,
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
              //      tem_id: templateIdDB[0].tem_id,
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
         //           tem_id: templateIdDB[0].tem_id,
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
    challengeName: string,
    user_id: number
) => {
    try {
        const userChallenging = [];
        const koreanDateISOString = getKoreanDateISOString();
        const koreanTime = new Date(koreanDateISOString);
        console.log(koreanTime);

        const challenge = await writeChallengeData(user_id);
        console.log(challenge?.challengeArray);
        const challengeArray = challenge?.challengeArray;

        for (var i = 0; i < challengeArray!.length; i++) {
            const ChallengeMap = challengeArray!.map((e) => {
                return { "challengeName": e.challenges.title, "category": e.challenges.category.name };
            });
            if (userChallenging.indexOf(ChallengeMap[i]) === -1) {
                userChallenging.push(ChallengeMap[i]);
            }

        }

        const challengingArray = [
            ...userChallenging.filter(item => item.challengeName === challengeName),
            ...userChallenging.filter(item => item.challengeName !== challengeName)
        ];
        console.log(challengingArray)


        const challengeIdCategoryDB =
            await prisma.challenges.findMany({
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
        const templateNameDB: TemplateDTO[] =
            await prisma.templates.findMany({
                where: {
                    chal_id: challengeIdCategoryDB[0].chal_id,
                },
                select: {
                    title: true,
                    content: true
                }
            });
        const challengeIdDB =
            await prisma.user_challenges.findMany({
                where: {
                    chal_id: challengeIdCategoryDB[0].chal_id,
                    user_id: user_id

                },
                select: {
                    uchal_id: true
                }
            })
        const challengeId = challengeIdDB[0].uchal_id
        const challengingDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: challengeId,
                created_at: koreanTime,
                complete: false
            },
            select: {
                title: true,
                writing: true,
                // templates: {
                //     select: {
                //         title: true
                //     }
                // },
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
        let templateCertain: boolean;
        var temporaryChallenge = challengingDB.map((e) => {
            return {
                "title": e.title,
                "writing": e.writing,
       //         "templates": e.templates.title,
                "userChallenge": e.user_challenges.challenges.title
            }
        });
        if (temporaryChallenge[0] == undefined) {
            templateCertain = false
        }
        else {
            templateCertain = true
        }

        for (var i = 0; i < templateNameDB.length; i++) {
            var category = challengeIdCategoryDB.map((e) => {
                return { "category": e.category.name, "image": e.category.emogi };
            });
            templateNameDB[i].category = category[0].category;
            templateNameDB[i].image = category[0].image;
        }
        const templates = templateNameDB.map((e) => {
            return { "templateTitle": e.title, "templateContent": e.content, "category": e.category, "image": e.image };

        })

        const challengeCategory = challengeIdCategoryDB[0].category.name;

        const templateData = { "challengeName": challengeName, "challengeCategory": challengeCategory, "templates": templates };

        prisma.$disconnect();
        return { templateCertain, temporaryChallenge, challengingArray, templateData };
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        return false;
    }
};

const insertImageData = async (
    challengeName: string,
    templateName: string,
    user_id: number,
    images: string[]
) => {
    try {

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

        const userChallengeDB = await prisma.user_challenges.findMany({
            where: {
                user_id: user_id,
                chal_id: challengeIdDB[0].chal_id
            },
            select: {
                uchal_id: true
            }
        });

        const userTemplateIdDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: userChallengeDB[0].uchal_id,
      //          tem_id: templateIdDB[0].tem_id
            },
            select: {
                uctem_id: true
            }
        });

        for (var i = 0; i < images.length; i++) {
            await prisma.user_template_image.createMany({
                data: {
                    uctem_id: userTemplateIdDB[0].uctem_id,
                    user_id: user_id,
                    image_url: images[i]
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

const insertVideoData = async (
    challengeName: string,
    templateName: string,
    user_id: number,
    videos: string[]
) => {
    try {

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

        const userChallengeDB = await prisma.user_challenges.findMany({
            where: {
                user_id: user_id,
                chal_id: challengeIdDB[0].chal_id
            },
            select: {
                uchal_id: true
            }
        });

        const userTemplateIdDB = await prisma.user_challenge_templetes.findMany({
            where: {
                uchal_id: userChallengeDB[0].uchal_id,
        //        tem_id: templateIdDB[0].tem_id
            },
            select: {
                uctem_id: true
            }
        });

        for (var i = 0; i < videos.length; i++) {
            await prisma.user_template_video.createMany({
                data: {
                    uctem_id: userTemplateIdDB[0].uctem_id,
                    user_id: user_id,
                    video_url: videos[i]
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



export {
    newChallengeData, startChallengeData, newChallengeResult,
    writeChallengeData, writeTemplateData, insertTemporaryChallengeData,
    insertChallengeCompleteData, selectTemplateData, insertImageData,
    insertVideoData
}