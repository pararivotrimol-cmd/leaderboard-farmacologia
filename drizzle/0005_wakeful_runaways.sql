CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentAccountId` int NOT NULL,
	`memberId` int NOT NULL,
	`week` int NOT NULL,
	`classDate` varchar(20) NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`distanceMeters` decimal(8,2),
	`status` enum('valid','invalid','manual') NOT NULL DEFAULT 'valid',
	`ipAddress` varchar(45),
	`userAgent` text,
	`note` text,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`matricula` varchar(30) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sessionToken` varchar(255),
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `studentAccounts_memberId_unique` UNIQUE(`memberId`),
	CONSTRAINT `studentAccounts_email_unique` UNIQUE(`email`),
	CONSTRAINT `studentAccounts_matricula_unique` UNIQUE(`matricula`)
);
