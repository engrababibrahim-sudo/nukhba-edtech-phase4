CREATE TABLE `teacher_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(50),
	`country` varchar(100),
	`city` varchar(100),
	`profilePhotoUrl` varchar(500),
	`bio` text,
	`qualification` varchar(255),
	`specialization` varchar(255),
	`yearsOfExperience` int NOT NULL DEFAULT 0,
	`subjects` json NOT NULL DEFAULT ('[]'),
	`educationStages` json NOT NULL DEFAULT ('[]'),
	`grades` json NOT NULL DEFAULT ('[]'),
	`teachingFormat` varchar(100),
	`hourlyRate` int,
	`availability` json NOT NULL DEFAULT ('[]'),
	`verificationStatus` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacher_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacher_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;