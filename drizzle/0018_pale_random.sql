CREATE TABLE `importHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`importedBy` int,
	`importedByName` varchar(200),
	`totalStudents` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`errorCount` int NOT NULL DEFAULT 0,
	`errors` text,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`source` varchar(50) NOT NULL DEFAULT 'unirio',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `importHistory_id` PRIMARY KEY(`id`)
);
