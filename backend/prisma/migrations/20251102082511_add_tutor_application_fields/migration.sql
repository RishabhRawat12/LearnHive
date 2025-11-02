-- AlterTable
ALTER TABLE `tutorprofile` ADD COLUMN `application_message` TEXT NULL,
    ADD COLUMN `credentials_url` VARCHAR(191) NULL,
    ADD COLUMN `subjects_applying_for` VARCHAR(191) NULL;
