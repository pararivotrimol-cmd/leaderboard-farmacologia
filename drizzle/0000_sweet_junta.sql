CREATE TABLE `activityTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`methodology` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`objectives` text NOT NULL,
	`duration` int,
	`xpValue` decimal(6,1) NOT NULL DEFAULT '0',
	`instructions` text,
	`materials` text,
	`assessment` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activityTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`questionId` int NOT NULL,
	`answer` text NOT NULL,
	`isCorrect` boolean,
	`pointsEarned` decimal(5,1),
	`answeredAt` timestamp NOT NULL,
	`timeSpent` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentIPBlocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`memberId` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentIPBlocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`eventType` enum('focus_lost','focus_regained','tab_switched','window_minimized','copy_attempt','right_click','keyboard_shortcut','network_issue','suspicious_activity','question_answered','time_warning','submission_started','submission_completed') NOT NULL,
	`details` text,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`flagged` boolean NOT NULL DEFAULT false,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentQuestionLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`questionId` int NOT NULL,
	`order` int NOT NULL,
	`points` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentQuestionLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`questionNumber` int NOT NULL,
	`question` text NOT NULL,
	`questionType` enum('multiple_choice','essay','true_false') NOT NULL,
	`options` text,
	`correctAnswer` text,
	`points` decimal(5,1) NOT NULL DEFAULT '1',
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`memberId` int NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`startedAt` timestamp NOT NULL,
	`submittedAt` timestamp,
	`score` decimal(5,1),
	`percentage` decimal(5,1),
	`passed` boolean,
	`status` enum('in_progress','submitted','graded') NOT NULL DEFAULT 'in_progress',
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`type` enum('multiple_choice','essay','mixed') NOT NULL DEFAULT 'multiple_choice',
	`totalQuestions` int NOT NULL DEFAULT 0,
	`timePerQuestion` int NOT NULL DEFAULT 120,
	`allowRetrocess` boolean NOT NULL DEFAULT false,
	`enableLockdown` boolean NOT NULL DEFAULT true,
	`passingScore` decimal(5,1) NOT NULL DEFAULT '60',
	`maxAttempts` int NOT NULL DEFAULT 1,
	`scheduledAt` timestamp,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`status` enum('draft','published','active','closed') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentAccountId` int NOT NULL,
	`memberId` int NOT NULL,
	`week` int NOT NULL,
	`classDate` varchar(20) NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`distanceMeters` decimal(8,2),
	`status` enum('valid','invalid','manual') NOT NULL DEFAULT 'valid',
	`ipAddress` varchar(45),
	`userAgent` text,
	`note` text,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`qrCodeSessionId` int NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`isValid` boolean NOT NULL DEFAULT true,
	`validationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendanceSummary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`totalSessions` int NOT NULL DEFAULT 0,
	`presentSessions` int NOT NULL DEFAULT 0,
	`absentSessions` int NOT NULL DEFAULT 0,
	`attendancePercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendanceSummary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`teacherName` varchar(200) NOT NULL,
	`teacherEmail` varchar(320) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backupRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupName` varchar(255) NOT NULL,
	`backupType` enum('full','partial','incremental') NOT NULL DEFAULT 'full',
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`fileSize` int,
	`fileUrl` varchar(500),
	`fileKey` varchar(500),
	`totalRecords` int NOT NULL DEFAULT 0,
	`recordsIncluded` text,
	`createdBy` int NOT NULL,
	`createdByName` varchar(200),
	`notes` text,
	`errorMessage` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `backupRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`iconUrl` text,
	`category` varchar(100) NOT NULL DEFAULT 'Geral',
	`week` int,
	`criteria` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`course` varchar(200) NOT NULL,
	`discipline` varchar(200) NOT NULL,
	`semester` varchar(20) NOT NULL DEFAULT '2026.1',
	`teacherAccountId` int,
	`teacherName` varchar(200),
	`color` varchar(20) NOT NULL DEFAULT '#F7941D',
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(50) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `courseSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `gameAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`condition` varchar(200) NOT NULL,
	`farmacologiaPointsBonus` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameCombats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameProgressId` int NOT NULL,
	`questId` int NOT NULL,
	`questionId` int NOT NULL,
	`playerAnswer` varchar(500),
	`correctAnswer` varchar(500),
	`isWon` boolean NOT NULL,
	`farmacologiaPointsEarned` int NOT NULL DEFAULT 0,
	`timeSpent` int NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameCombats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameMissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekNumber` int NOT NULL,
	`classId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`pharmacologyTopic` varchar(200) NOT NULL,
	`clinicalCase` json NOT NULL,
	`decisions` json NOT NULL,
	`difficulty` int NOT NULL DEFAULT 1,
	`pfReward` int NOT NULL DEFAULT 10,
	`hints` json NOT NULL DEFAULT ('[]'),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameMissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`farmacologiaPoints` int NOT NULL DEFAULT 0,
	`experience` int NOT NULL DEFAULT 0,
	`questsCompleted` int NOT NULL DEFAULT 0,
	`questsTotal` int NOT NULL DEFAULT 0,
	`currentQuestId` int,
	`totalCombats` int NOT NULL DEFAULT 0,
	`combatsWon` int NOT NULL DEFAULT 0,
	`combatsLost` int NOT NULL DEFAULT 0,
	`achievements` text DEFAULT ('[]'),
	`isCompleted` boolean NOT NULL DEFAULT false,
	`lastPlayedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameQuests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`npcName` varchar(100) NOT NULL,
	`npcType` enum('merchant','warrior','mage','healer','boss') NOT NULL,
	`level` int NOT NULL,
	`questType` enum('combat','puzzle','dialogue','collection') NOT NULL,
	`farmacologiaPointsReward` int NOT NULL DEFAULT 10,
	`experienceReward` int NOT NULL DEFAULT 100,
	`questionId` int,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`isActive` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameQuests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `inviteCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`description` varchar(200),
	`maxUses` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`createdBy` varchar(200) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inviteCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `inviteCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `jigsawExpertGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`topicId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`maxMembers` int NOT NULL DEFAULT 14,
	`status` enum('forming','active','presenting','completed') NOT NULL DEFAULT 'forming',
	`presentationDate` timestamp,
	`presentationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawExpertGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawExpertMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertGroupId` int NOT NULL,
	`memberId` int NOT NULL,
	`role` enum('member','coordinator','presenter') NOT NULL DEFAULT 'member',
	`presentationScore` decimal(3,1) DEFAULT '0',
	`participationScore` decimal(3,1) DEFAULT '0',
	`readingProgress` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawExpertMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`groupType` enum('seminar','clinical_case','kahoot') NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`maxMembers` int NOT NULL DEFAULT 5,
	`currentMembers` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdByName` varchar(200),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawHomeGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`meetingNumber` int NOT NULL,
	`meetingDate` timestamp,
	`status` enum('forming','active','completed') NOT NULL DEFAULT 'forming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawHomeGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawHomeMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`homeGroupId` int NOT NULL,
	`memberId` int NOT NULL,
	`topicId` int NOT NULL,
	`presentationScore` decimal(3,1) DEFAULT '0',
	`participationScore` decimal(3,1) DEFAULT '0',
	`peerRating` decimal(3,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawHomeMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jigsawGroupId` int NOT NULL,
	`memberId` int NOT NULL,
	`memberName` varchar(200) NOT NULL,
	`role` enum('coordinator','reporter','researcher','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jigsawMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`classId` int NOT NULL,
	`expertGroupId` int,
	`homeGroupIds` text,
	`totalPresentationScore` decimal(5,1) DEFAULT '0',
	`totalParticipationScore` decimal(5,1) DEFAULT '0',
	`totalPeerRating` decimal(5,1) DEFAULT '0',
	`totalJigsawPF` decimal(6,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jigsawTopics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`articleUrl` varchar(500),
	`articleTitle` varchar(300),
	`articleAuthors` varchar(300),
	`articleYear` int,
	`keyPoints` text,
	`studyDuration` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jigsawTopics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `memberBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `memberBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`classId` int,
	`name` varchar(200) NOT NULL,
	`xp` decimal(6,1) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text,
	`priority` enum('normal','important','urgent') NOT NULL DEFAULT 'normal',
	`type` enum('banner','announcement','reminder') NOT NULL DEFAULT 'announcement',
	`isActive` int NOT NULL DEFAULT 1,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oracleMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missionId` int NOT NULL,
	`triggerType` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`audioUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oracleMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `qrCodeSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`teacherId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`qrCodeData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qrCodeSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionBank` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`tags` text,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','essay','true_false') NOT NULL DEFAULT 'multiple_choice',
	`alternatives` text,
	`correctAnswer` varchar(255),
	`imageUrl` text,
	`formulaLatex` text,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`points` int NOT NULL DEFAULT 1,
	`estimatedTime` int,
	`timesUsed` int NOT NULL DEFAULT 0,
	`correctRate` decimal(5,2) DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionBank_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`memberId` int NOT NULL,
	`isCorrect` boolean NOT NULL,
	`timeSpent` int,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restoreHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupId` int NOT NULL,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`recordsRestored` int NOT NULL DEFAULT 0,
	`recordsFailed` int NOT NULL DEFAULT 0,
	`restoredBy` int NOT NULL,
	`restoredByName` varchar(200),
	`notes` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `restoreHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminarArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seminarId` int NOT NULL,
	`pmid` varchar(50) NOT NULL,
	`title` text NOT NULL,
	`authors` text,
	`journal` varchar(300),
	`year` int,
	`abstract` text,
	`url` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seminarArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminarParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seminarId` int NOT NULL,
	`roleId` int NOT NULL,
	`memberId` int,
	`memberName` varchar(200),
	`individualPF` decimal(5,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seminarParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminarRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seminarRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seminars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`date` varchar(20) NOT NULL,
	`groupPF` decimal(5,1) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seminars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int,
	`email` varchar(320) NOT NULL,
	`matricula` varchar(30) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sessionToken` varchar(255),
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `studentAccounts_memberId_unique` UNIQUE(`memberId`),
	CONSTRAINT `studentAccounts_email_unique` UNIQUE(`email`),
	CONSTRAINT `studentAccounts_matricula_unique` UNIQUE(`matricula`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseName` varchar(255) NOT NULL DEFAULT 'Farmacologia I',
	`semester` varchar(50) NOT NULL DEFAULT '2026.1',
	`academicYear` varchar(50) NOT NULL DEFAULT '2026',
	`institution` varchar(255) NOT NULL DEFAULT 'UNIRIO',
	`department` varchar(255) NOT NULL DEFAULT 'Farmacologia',
	`startDate` varchar(20),
	`endDate` varchar(20),
	`totalWeeks` int NOT NULL DEFAULT 17,
	`schedule` text,
	`description` text,
	`logoUrl` varchar(500),
	`primaryColor` varchar(7) DEFAULT '#FF9500',
	`secondaryColor` varchar(7) DEFAULT '#1A1A2E',
	`updatedBy` int,
	`updatedByName` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacherAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`role` enum('super_admin','coordenador','professor') NOT NULL DEFAULT 'professor',
	`isActive` int NOT NULL DEFAULT 1,
	`sessionToken` varchar(255),
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacherAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacherAccounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `teacherTeams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherAccountId` int NOT NULL,
	`teamId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacherTeams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`emoji` varchar(10) NOT NULL DEFAULT '🧪',
	`color` varchar(20) NOT NULL DEFAULT '#10b981',
	`classId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `weeklyHighlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` int NOT NULL,
	`date` varchar(20) NOT NULL,
	`activity` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`topTeam` varchar(100) NOT NULL DEFAULT '—',
	`topStudent` varchar(200) NOT NULL DEFAULT '—',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyHighlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xpActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(10) NOT NULL DEFAULT '🎯',
	`maxXP` decimal(5,1) NOT NULL DEFAULT '1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xpActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xpHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`week` int NOT NULL,
	`xpValue` decimal(6,1) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `xpHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE `assessmentAnswers` ADD CONSTRAINT `assessmentAnswers_submissionId_assessmentSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `assessmentSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentAnswers` ADD CONSTRAINT `assessmentAnswers_questionId_assessmentQuestions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `assessmentQuestions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentIPBlocks` ADD CONSTRAINT `assessmentIPBlocks_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentIPBlocks` ADD CONSTRAINT `assessmentIPBlocks_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentLogs` ADD CONSTRAINT `assessmentLogs_submissionId_assessmentSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `assessmentSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentQuestionLinks` ADD CONSTRAINT `assessmentQuestionLinks_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentQuestionLinks` ADD CONSTRAINT `assessmentQuestionLinks_questionId_questionBank_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionBank`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentQuestions` ADD CONSTRAINT `assessmentQuestions_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentSubmissions` ADD CONSTRAINT `assessmentSubmissions_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentSubmissions` ADD CONSTRAINT `assessmentSubmissions_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameCombats` ADD CONSTRAINT `gameCombats_gameProgressId_gameProgress_id_fk` FOREIGN KEY (`gameProgressId`) REFERENCES `gameProgress`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameCombats` ADD CONSTRAINT `gameCombats_questId_gameQuests_id_fk` FOREIGN KEY (`questId`) REFERENCES `gameQuests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameCombats` ADD CONSTRAINT `gameCombats_questionId_questionBank_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionBank`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameProgress` ADD CONSTRAINT `gameProgress_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameProgress` ADD CONSTRAINT `gameProgress_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameQuests` ADD CONSTRAINT `gameQuests_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameQuests` ADD CONSTRAINT `gameQuests_questionId_questionBank_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionBank`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawExpertGroups` ADD CONSTRAINT `jigsawExpertGroups_topicId_jigsawTopics_id_fk` FOREIGN KEY (`topicId`) REFERENCES `jigsawTopics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawExpertMembers` ADD CONSTRAINT `jigsawExpertMembers_expertGroupId_jigsawExpertGroups_id_fk` FOREIGN KEY (`expertGroupId`) REFERENCES `jigsawExpertGroups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawExpertMembers` ADD CONSTRAINT `jigsawExpertMembers_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawHomeMembers` ADD CONSTRAINT `jigsawHomeMembers_homeGroupId_jigsawHomeGroups_id_fk` FOREIGN KEY (`homeGroupId`) REFERENCES `jigsawHomeGroups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawHomeMembers` ADD CONSTRAINT `jigsawHomeMembers_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawHomeMembers` ADD CONSTRAINT `jigsawHomeMembers_topicId_jigsawTopics_id_fk` FOREIGN KEY (`topicId`) REFERENCES `jigsawTopics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawScores` ADD CONSTRAINT `jigsawScores_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jigsawScores` ADD CONSTRAINT `jigsawScores_expertGroupId_jigsawExpertGroups_id_fk` FOREIGN KEY (`expertGroupId`) REFERENCES `jigsawExpertGroups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionBank` ADD CONSTRAINT `questionBank_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionPerformance` ADD CONSTRAINT `questionPerformance_questionId_questionBank_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionBank`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionPerformance` ADD CONSTRAINT `questionPerformance_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionPerformance` ADD CONSTRAINT `questionPerformance_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restoreHistory` ADD CONSTRAINT `restoreHistory_backupId_backupRecords_id_fk` FOREIGN KEY (`backupId`) REFERENCES `backupRecords`(`id`) ON DELETE no action ON UPDATE no action;