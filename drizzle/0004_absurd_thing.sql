CREATE INDEX `teacher_verification_idx` ON `teacher_profiles` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `users_marketplace_visibility` ON `users` (`role`,`accountStatus`);