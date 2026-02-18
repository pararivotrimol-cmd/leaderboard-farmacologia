CREATE TABLE `activityTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`methodology` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`objectives` text NOT NULL,
	`duration` int,
	`xpValue` decimal(6,1) NOT NULL DEFAULT '0',
	`instructions` text,
	`materials` text,
	`assessment` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activityTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`teacherName` varchar(200) NOT NULL,
	`teacherEmail` varchar(320) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `teacherTeams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`teamId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacherTeams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teacherAccounts` ADD `role` enum('coordenador','professor') DEFAULT 'professor' NOT NULL;