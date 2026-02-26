CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`type` enum('individual','team','both') NOT NULL DEFAULT 'both',
	`maxPoints` decimal(6,1) NOT NULL DEFAULT '10',
	`dueDate` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activityPointsLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`teamId` int NOT NULL,
	`activityId` int,
	`pointsChange` decimal(6,1) NOT NULL,
	`reason` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityPointsLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activitySubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`memberId` int NOT NULL,
	`teamId` int,
	`response` text,
	`pointsAwarded` decimal(6,1) DEFAULT '0',
	`status` enum('pending','submitted','graded','rejected') NOT NULL DEFAULT 'pending',
	`feedback` text,
	`submittedAt` timestamp,
	`gradedAt` timestamp,
	`gradedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activitySubmissions_id` PRIMARY KEY(`id`)
);
