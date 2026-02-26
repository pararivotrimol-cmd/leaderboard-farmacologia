CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`enabledTypes` text NOT NULL DEFAULT ('["team_allocation","grade_update","announcement","reminder","attendance"]'),
	`quietHoursStart` int NOT NULL DEFAULT 22,
	`quietHoursEnd` int NOT NULL DEFAULT 8,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_memberId_unique` UNIQUE(`memberId`)
);
