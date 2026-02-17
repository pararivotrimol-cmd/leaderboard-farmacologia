CREATE TABLE `courseSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(50) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `courseSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`xp` decimal(6,1) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`emoji` varchar(10) NOT NULL DEFAULT '🧪',
	`color` varchar(20) NOT NULL DEFAULT '#10b981',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyHighlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` int NOT NULL,
	`date` varchar(20) NOT NULL,
	`activity` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`topTeam` varchar(100) NOT NULL DEFAULT '—',
	`topStudent` varchar(200) NOT NULL DEFAULT '—',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyHighlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xpActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(10) NOT NULL DEFAULT '🎯',
	`maxXP` decimal(5,1) NOT NULL DEFAULT '1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xpActivities_id` PRIMARY KEY(`id`)
);
