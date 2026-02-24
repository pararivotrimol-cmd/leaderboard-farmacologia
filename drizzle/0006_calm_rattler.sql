ALTER TABLE `qrCodeSessions` ADD `currentToken` varchar(128);--> statement-breakpoint
ALTER TABLE `qrCodeSessions` ADD `tokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `qrCodeSessions` ADD `tokenRotationCount` int DEFAULT 0 NOT NULL;