CREATE TABLE `studentNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int,
	`title` varchar(300) NOT NULL,
	`message` text NOT NULL,
	`type` enum('team_allocation','grade_update','attendance','announcement','reminder') NOT NULL,
	`priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`isDismissed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentNotifications_id` PRIMARY KEY(`id`)
);
