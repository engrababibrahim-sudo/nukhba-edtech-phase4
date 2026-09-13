CREATE TABLE `learning_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`role` varchar(100),
	`grade` varchar(100),
	`stage` varchar(100),
	`subject` varchar(150),
	`goal` text,
	`level` varchar(100),
	`difficulties` text,
	`needs` text,
	`format` varchar(150),
	`availability` varchar(150),
	`time` varchar(150),
	`answers` json NOT NULL DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `learning_profiles_studentUserId_unique` UNIQUE(`studentUserId`)
);
--> statement-breakpoint
CREATE TABLE `parent_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parent_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `parent_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `parent_student_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`studentUserId` int NOT NULL,
	`relationshipType` varchar(50) DEFAULT 'parent',
	`status` enum('pending','active','revoked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parent_student_relationships_id` PRIMARY KEY(`id`),
	CONSTRAINT `parent_student_unique` UNIQUE(`parentUserId`,`studentUserId`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255),
	`educationStage` varchar(100),
	`grade` varchar(100),
	`preferredSubjects` json NOT NULL DEFAULT ('[]'),
	`learningLevel` varchar(100),
	`learningGoals` text,
	`strengths` text,
	`difficulties` text,
	`preferredLearningFormat` varchar(100),
	`preferredAvailability` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `learning_profiles` ADD CONSTRAINT `learning_profiles_studentUserId_users_id_fk` FOREIGN KEY (`studentUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parent_profiles` ADD CONSTRAINT `parent_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parent_student_relationships` ADD CONSTRAINT `parent_student_relationships_parentUserId_users_id_fk` FOREIGN KEY (`parentUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parent_student_relationships` ADD CONSTRAINT `parent_student_relationships_studentUserId_users_id_fk` FOREIGN KEY (`studentUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;