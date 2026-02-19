CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`course` varchar(200) NOT NULL,
	`discipline` varchar(200) NOT NULL,
	`semester` varchar(20) NOT NULL DEFAULT '2026.1',
	`teacherAccountId` int,
	`teacherName` varchar(200),
	`color` varchar(20) NOT NULL DEFAULT '#F7941D',
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `members` ADD `classId` int;--> statement-breakpoint
ALTER TABLE `teams` ADD `classId` int;