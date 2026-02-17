CREATE TABLE `onlineMeetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`monitorName` varchar(200) NOT NULL,
	`meetingUrl` text NOT NULL,
	`platform` enum('google_meet','zoom','teams','discord','other') NOT NULL DEFAULT 'google_meet',
	`scheduledAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 60,
	`module` varchar(100) NOT NULL DEFAULT 'Geral',
	`status` enum('scheduled','live','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`maxParticipants` int NOT NULL DEFAULT 0,
	`isVisible` int NOT NULL DEFAULT 1,
	`recurrence` enum('none','weekly') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onlineMeetings_id` PRIMARY KEY(`id`)
);
