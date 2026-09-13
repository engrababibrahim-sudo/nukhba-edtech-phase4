CREATE TABLE `bookings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `studentId` int NOT NULL,
  `teacherId` int NOT NULL,
  `startAt` timestamp NOT NULL,
  `endAt` timestamp NOT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'UTC',
  `status` enum('pending','confirmed','cancelled','completed','rejected') NOT NULL DEFAULT 'pending',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `teacher_availability` (
  `id` int AUTO_INCREMENT NOT NULL,
  `teacherId` int NOT NULL,
  `dayOfWeek` int,
  `specificDate` date,
  `startTime` varchar(5) NOT NULL,
  `endTime` varchar(5) NOT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'UTC',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `teacher_availability_id` PRIMARY KEY(`id`)
);

ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_studentId_users_id_fk`
  FOREIGN KEY (`studentId`) REFERENCES `users`(`id`);

ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_teacherId_teacher_profiles_id_fk`
  FOREIGN KEY (`teacherId`) REFERENCES `teacher_profiles`(`id`);

ALTER TABLE `teacher_availability`
  ADD CONSTRAINT `teacher_availability_teacherId_teacher_profiles_id_fk`
  FOREIGN KEY (`teacherId`) REFERENCES `teacher_profiles`(`id`);

CREATE INDEX `bookings_teacher_time`
  ON `bookings` (`teacherId`,`startAt`,`endAt`,`status`);

CREATE INDEX `bookings_student_time`
  ON `bookings` (`studentId`,`startAt`,`endAt`,`status`);

CREATE INDEX `teacher_availability_lookup`
  ON `teacher_availability` (`teacherId`,`status`,`dayOfWeek`,`specificDate`);