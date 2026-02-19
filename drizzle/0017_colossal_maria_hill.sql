CREATE TABLE `jigsawGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`groupType` enum('seminar','clinical_case','kahoot') NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`maxMembers` int NOT NULL DEFAULT 5,
	`currentMembers` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdByName` varchar(200),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jigsawGroupId` int NOT NULL,
	`memberId` int NOT NULL,
	`memberName` varchar(200) NOT NULL,
	`role` enum('coordinator','reporter','researcher','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jigsawMembers_id` PRIMARY KEY(`id`)
);
