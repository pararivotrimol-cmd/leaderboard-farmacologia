CREATE TABLE `scheduleEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int,
	`weekLabel` varchar(50) NOT NULL,
	`weekDate` varchar(30),
	`title` varchar(300) NOT NULL,
	`detail` text,
	`type` varchar(50) NOT NULL DEFAULT 'aula',
	`highlight` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduleEntries_id` PRIMARY KEY(`id`)
);
