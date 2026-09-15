CREATE TABLE `student_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentUserId` int NOT NULL,
	`favoriteType` enum('teacher','course') NOT NULL,
	`targetId` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_favorite_unique` UNIQUE(`studentUserId`,`favoriteType`,`targetId`)
);
--> statement-breakpoint
ALTER TABLE `student_favorites` ADD CONSTRAINT `student_favorites_studentUserId_users_id_fk` FOREIGN KEY (`studentUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `student_favorite_lookup` ON `student_favorites` (`studentUserId`,`favoriteType`);
