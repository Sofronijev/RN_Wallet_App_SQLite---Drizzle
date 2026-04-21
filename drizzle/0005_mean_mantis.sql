CREATE TABLE `UpcomingPaymentContributions` (
	`id` integer PRIMARY KEY NOT NULL,
	`instanceId` integer NOT NULL,
	`transactionId` integer NOT NULL,
	`amount` real NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`instanceId`) REFERENCES `UpcomingPaymentInstances`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`transactionId`) REFERENCES `Transactions`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `UpcomingPaymentInstances` (
	`id` integer PRIMARY KEY NOT NULL,
	`upcomingPaymentId` integer NOT NULL,
	`dueDate` text NOT NULL,
	`expectedAmount` real,
	`status` text(10) DEFAULT 'pending' NOT NULL,
	`paidAt` text,
	`canceledAt` text,
	`notificationIds` text,
	FOREIGN KEY (`upcomingPaymentId`) REFERENCES `UpcomingPayments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `upcoming_instance_unique_due` ON `UpcomingPaymentInstances` (`upcomingPaymentId`,`dueDate`);--> statement-breakpoint
CREATE TABLE `UpcomingPayments` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real,
	`categoryId` integer NOT NULL,
	`typeId` integer,
	`currencyCode` text(10) NOT NULL,
	`currencySymbol` text(10) DEFAULT '' NOT NULL,
	`userId` integer DEFAULT 1 NOT NULL,
	`firstDueDate` text NOT NULL,
	`endDate` text,
	`recurrence` text(10) DEFAULT 'none' NOT NULL,
	`customIntervalValue` integer,
	`customIntervalUnit` text,
	`notifyDaysBefore` integer,
	`notifyOnDueDay` integer DEFAULT true NOT NULL,
	`notifyOnMissed` integer DEFAULT true NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`typeId`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
