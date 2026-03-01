CREATE TABLE `scheduleEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekLabel` varchar(50) NOT NULL,
	`weekDate` varchar(20),
	`title` varchar(300) NOT NULL,
	`detail` text,
	`type` varchar(50) NOT NULL DEFAULT 'aula',
	`highlight` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`gameWeekNumber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduleEntries_id` PRIMARY KEY(`id`)
);
