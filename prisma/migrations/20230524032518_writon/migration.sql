-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(20) NOT NULL,
    `identifier` VARCHAR(40) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(40) NOT NULL,
    `nickname` VARCHAR(40) NOT NULL,
    `level` INTEGER NULL,
    `mar_email` TINYINT NOT NULL DEFAULT 0,
    `phone` VARCHAR(30) NOT NULL,
    `coopon` TINYINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `identifierUnique`(`identifier`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `cate_id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(20) NOT NULL,
    `name` VARCHAR(40) NOT NULL,
    `emogi` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`cate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challenges` (
    `chal_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cate_id` INTEGER NOT NULL,
    `title` VARCHAR(40) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cate_idForeignKey`(`cate_id`),
    PRIMARY KEY (`chal_id`, `cate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `tem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `chal_id` INTEGER NOT NULL,
    `title` VARCHAR(40) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `templatescol` VARCHAR(45) NULL,

    INDEX `chal_idForeignKey3_idx`(`chal_id`),
    PRIMARY KEY (`tem_id`, `chal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_challenges` (
    `uchal_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `chal_id` INTEGER NOT NULL,
    `complete` BOOLEAN NULL,
    `start_at` DATE NOT NULL DEFAULT (curdate()),
    `finish_at` DATE NULL,

    INDEX `chal_idForeignKey2`(`chal_id`),
    INDEX `user_idForeignKey2`(`user_id`),
    PRIMARY KEY (`uchal_id`, `user_id`, `chal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_challenge_templetes` (
    `uctem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `uchal_id` INTEGER NOT NULL,
    `tem_id` INTEGER NOT NULL,
    `title` VARCHAR(30) NULL,
    `writing` LONGTEXT NOT NULL,
    `complete` BOOLEAN NULL,
    `created_at` DATE NOT NULL DEFAULT (curdate()),
    `update_at` DATE NOT NULL DEFAULT (curdate()),
    `finish_at` DATE NULL,

    INDEX `tem_idForeignKey2`(`tem_id`),
    INDEX `uchal_idForeignKey2`(`uchal_id`),
    PRIMARY KEY (`uctem_id`, `uchal_id`, `tem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_template_image` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `uctem_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `image_url` VARCHAR(245) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_idForeignKey5`(`user_id`),
    INDEX `uctem_idForeignKey5`(`uctem_id`),
    PRIMARY KEY (`image_id`, `uctem_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_template_video` (
    `video_id` INTEGER NOT NULL AUTO_INCREMENT,
    `uctem_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `video_url` VARCHAR(245) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_idForeignKey6`(`user_id`),
    INDEX `uctem_idForeignKey6`(`uctem_id`),
    PRIMARY KEY (`video_id`, `uctem_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `challenges` ADD CONSTRAINT `cate_idForeignKey` FOREIGN KEY (`cate_id`) REFERENCES `category`(`cate_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `chal_idForeignKey4` FOREIGN KEY (`chal_id`) REFERENCES `challenges`(`chal_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_challenges` ADD CONSTRAINT `user_idForeignKey2` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_challenges` ADD CONSTRAINT `chal_idForeignKey2` FOREIGN KEY (`chal_id`) REFERENCES `challenges`(`chal_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_challenge_templetes` ADD CONSTRAINT `tem_idForeignKey2` FOREIGN KEY (`tem_id`) REFERENCES `templates`(`tem_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_challenge_templetes` ADD CONSTRAINT `uchal_idForeignKey2` FOREIGN KEY (`uchal_id`) REFERENCES `user_challenges`(`uchal_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_template_image` ADD CONSTRAINT `user_idForeignKey5` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_template_image` ADD CONSTRAINT `uctem_idForeignKey5` FOREIGN KEY (`uctem_id`) REFERENCES `user_challenge_templetes`(`uctem_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_template_video` ADD CONSTRAINT `user_idForeignKey6` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_template_video` ADD CONSTRAINT `uctem_idForeignKey6` FOREIGN KEY (`uctem_id`) REFERENCES `user_challenge_templetes`(`uctem_id`) ON DELETE CASCADE ON UPDATE CASCADE;
