CREATE TABLE `monitorActivityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`monitorId` int NOT NULL,
	`monitorName` varchar(200) NOT NULL,
	`actionType` varchar(100) NOT NULL,
	`actionDescription` text NOT NULL,
	`targetEntity` varchar(100),
	`targetId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitorActivityLogs_id` PRIMARY KEY(`id`)
);
