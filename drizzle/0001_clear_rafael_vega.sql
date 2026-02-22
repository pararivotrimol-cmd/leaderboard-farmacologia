CREATE TABLE `gameTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`pfAmount` int NOT NULL,
	`transactionType` varchar(50) NOT NULL,
	`missionId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gameTransactions` ADD CONSTRAINT `gameTransactions_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameTransactions` ADD CONSTRAINT `gameTransactions_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;