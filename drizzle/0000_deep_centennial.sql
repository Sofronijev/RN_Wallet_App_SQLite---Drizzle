CREATE TABLE `Categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255) NOT NULL,
	`type` text(255) DEFAULT 'custom' NOT NULL,
	`iconFamily` text(255) NOT NULL,
	`iconName` text(255) NOT NULL,
	`iconColor` text(255) NOT NULL,
	`transactionType` text(20) DEFAULT 'expense' NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`description` text(300),
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`type_id` integer,
	`categoryId` integer NOT NULL,
	`wallet_id` integer NOT NULL,
	`transfer_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`transfer_id`) REFERENCES `Transfer`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Transfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`userId` integer DEFAULT 1 NOT NULL,
	`fromWalletId` integer NOT NULL,
	`toWalletId` integer NOT NULL,
	`fromTransactionId` integer NOT NULL,
	`toTransactionId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255) NOT NULL,
	`type` text(255) DEFAULT 'custom' NOT NULL,
	`categoryId` integer NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(255) DEFAULT '',
	`password` text(255),
	`email` text(255),
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	`selectedWalletId` integer DEFAULT 1,
	`delimiter` text(5) DEFAULT '.' NOT NULL,
	`decimal` text(5) DEFAULT ',' NOT NULL,
	`pinCode` text(8) DEFAULT '' NOT NULL,
	`isPinEnabled` integer DEFAULT false NOT NULL,
	`showTotalAmount` integer DEFAULT true NOT NULL,
	`inactivePinTimeout` integer DEFAULT NULL,
	`primaryWalletId` integer DEFAULT NULL,
	FOREIGN KEY (`primaryWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Users_email_unique` ON `Users` (`email`);--> statement-breakpoint
CREATE TABLE `Wallet` (
	`walletId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`startingBalance` real DEFAULT 0 NOT NULL,
	`walletName` text(255) DEFAULT 'My custom wallet' NOT NULL,
	`currencyCode` text(10) DEFAULT '',
	`currencySymbol` text(10) DEFAULT '',
	`color` text(7) DEFAULT '#3EB489' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
