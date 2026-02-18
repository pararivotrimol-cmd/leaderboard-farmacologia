CREATE TABLE `seminarArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seminarId` int NOT NULL,
	`pmid` varchar(50) NOT NULL,
	`title` text NOT NULL,
	`authors` text,
	`journal` varchar(300),
	`year` int,
	`abstract` text,
	`url` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seminarArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminarParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seminarId` int NOT NULL,
	`roleId` int NOT NULL,
	`memberId` int,
	`memberName` varchar(200),
	`individualPF` decimal(5,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seminarParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminarRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seminarRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`date` varchar(20) NOT NULL,
	`groupPF` decimal(5,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seminars_id` PRIMARY KEY(`id`)
);
