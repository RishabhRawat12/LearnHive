-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('student', 'tutor', 'ADMIN') NOT NULL DEFAULT 'student';
