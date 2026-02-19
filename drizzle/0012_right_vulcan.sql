CREATE TABLE `emailLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`teacherName` varchar(200) NOT NULL,
	`teacherEmail` varchar(200) NOT NULL,
	`seminarId` int,
	`subject` varchar(300) NOT NULL,
	`body` text NOT NULL,
	`recipientCount` int NOT NULL DEFAULT 0,
	`recipients` text,
	`status` varchar(50) NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailLog_id` PRIMARY KEY(`id`)
);
