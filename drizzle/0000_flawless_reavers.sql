CREATE TABLE `Categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`type` text(255) DEFAULT 'custom'
);
--> statement-breakpoint
CREATE TABLE `Transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real,
	`description` text(255),
	`date` text DEFAULT CURRENT_TIMESTAMP,
	`user_id` integer,
	`type_id` integer,
	`categoryId` integer,
	`wallet_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Transfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP,
	`userId` integer,
	`fromWalletId` integer,
	`toWalletId` integer,
	`fromTransactionId` integer,
	`toTransactionId` integer,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromTransactionId`) REFERENCES `Transactions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toTransactionId`) REFERENCES `Transactions`(`id`) ON UPDATE cascade ON DELETE cascade
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
	`user_id` integer,
	`startingBalance` real DEFAULT 0,
	`walletName` text(255) DEFAULT 'My custom wallet',
	`currencyCode` text(3) DEFAULT 'EUR',
	`currencySymbol` text(3) DEFAULT '€',
	`type` text(255) DEFAULT 'custom',
	`color` text(7) DEFAULT '#3EB489',
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
