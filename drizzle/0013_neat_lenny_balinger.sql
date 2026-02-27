ALTER TABLE `studentAccounts` ADD `accountType` enum('student','monitor','external') DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `studentAccounts` ADD `displayName` varchar(200);