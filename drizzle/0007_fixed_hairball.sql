CREATE TABLE `xpHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`week` int NOT NULL,
	`xpValue` decimal(6,1) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `xpHistory_id` PRIMARY KEY(`id`)
);
