CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`iconUrl` text,
	`category` varchar(100) NOT NULL DEFAULT 'Geral',
	`week` int,
	`criteria` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `memberBadges_id` PRIMARY KEY(`id`)
);
