CREATE TABLE `gameErrorReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`questId` int,
	`reportType` enum('error','doubt','suggestion') NOT NULL DEFAULT 'error',
	`description` text NOT NULL,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`teacherResponse` text,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameErrorReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameWeeklyReleases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`weekNumber` int NOT NULL,
	`questIds` text NOT NULL DEFAULT ('[]'),
	`title` varchar(200),
	`description` text,
	`isReleased` boolean NOT NULL DEFAULT false,
	`releasedAt` timestamp,
	`releasedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameWeeklyReleases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerAvatars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`characterId` varchar(50),
	`skinTone` varchar(50),
	`hairStyle` varchar(50),
	`hairColor` varchar(50),
	`clothingColor` varchar(50),
	`accessory` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerAvatars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gameErrorReports` ADD CONSTRAINT `gameErrorReports_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameErrorReports` ADD CONSTRAINT `gameErrorReports_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameErrorReports` ADD CONSTRAINT `gameErrorReports_questId_gameQuests_id_fk` FOREIGN KEY (`questId`) REFERENCES `gameQuests`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameWeeklyReleases` ADD CONSTRAINT `gameWeeklyReleases_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerAvatars` ADD CONSTRAINT `playerAvatars_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;