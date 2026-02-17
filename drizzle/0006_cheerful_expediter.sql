CREATE TABLE `youtubePlaylistsTable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`youtubeId` varchar(100) NOT NULL,
	`videoType` enum('playlist','video') NOT NULL DEFAULT 'playlist',
	`module` varchar(100) NOT NULL DEFAULT 'Geral',
	`week` int,
	`thumbnailUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isVisible` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtubePlaylistsTable_id` PRIMARY KEY(`id`)
);
