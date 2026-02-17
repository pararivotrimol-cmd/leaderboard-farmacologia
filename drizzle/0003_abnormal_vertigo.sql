CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`type` enum('file','link','comment') NOT NULL,
	`url` text,
	`fileKey` varchar(500),
	`fileName` varchar(300),
	`mimeType` varchar(100),
	`module` varchar(100) NOT NULL DEFAULT 'Geral',
	`week` int,
	`isVisible` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
