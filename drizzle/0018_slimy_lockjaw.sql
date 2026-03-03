CREATE TABLE `jigsawPeerEvaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`homeGroupId` int NOT NULL,
	`evaluatorMemberId` int NOT NULL,
	`evaluatedMemberId` int NOT NULL,
	`rating` decimal(2,1) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawPeerEvaluations_id` PRIMARY KEY(`id`)
);
