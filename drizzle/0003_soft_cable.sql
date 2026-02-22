CREATE TABLE `bossBattles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`weekNumber` int NOT NULL,
	`isVictory` boolean NOT NULL DEFAULT false,
	`bossName` varchar(100) NOT NULL,
	`totalDamageDealt` int NOT NULL DEFAULT 0,
	`playerHpRemaining` int NOT NULL DEFAULT 0,
	`phasesCompleted` int NOT NULL DEFAULT 0,
	`totalPhases` int NOT NULL DEFAULT 3,
	`comboMax` int NOT NULL DEFAULT 0,
	`pfEarned` int NOT NULL DEFAULT 0,
	`xpEarned` int NOT NULL DEFAULT 0,
	`totalTimeSpent` int NOT NULL DEFAULT 0,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bossBattles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bossBattles` ADD CONSTRAINT `bossBattles_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bossBattles` ADD CONSTRAINT `bossBattles_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;