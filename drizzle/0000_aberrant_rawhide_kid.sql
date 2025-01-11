CREATE TABLE `Categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`type` text(255) DEFAULT 'custom'
);
--> statement-breakpoint
CREATE TABLE `Transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`description` text(300),
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`type_id` integer NOT NULL,
	`categoryId` integer NOT NULL,
	`wallet_id` integer NOT NULL,
	`transfer_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`transfer_id`) REFERENCES `Transfer`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Transfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP,
	`userId` integer DEFAULT 1,
	`fromWalletId` integer,
	`toWalletId` integer,
	`fromTransactionId` integer,
	`toTransactionId` integer,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`type` text(255) DEFAULT 'custom',
	`categoryId` integer,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(255) DEFAULT '',
	`password` text(255),
	`email` text(255),
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	`selectedWalletId` integer DEFAULT 1
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
	`type` text(255) DEFAULT 'custom' NOT NULL,
	`color` text(7) DEFAULT '#3EB489' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
