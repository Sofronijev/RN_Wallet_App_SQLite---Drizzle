PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Transactions` (
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
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`transfer_id`) REFERENCES `Transfer`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_Transactions`("id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id", "transfer_id") SELECT "id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id", "transfer_id" FROM `Transactions`;--> statement-breakpoint
DROP TABLE `Transactions`;--> statement-breakpoint
ALTER TABLE `__new_Transactions` RENAME TO `Transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Transfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP,
	`userId` integer DEFAULT 1,
	`fromWalletId` integer,
	`toWalletId` integer,
	`fromTransactionId` integer,
	`toTransactionId` integer,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_Transfer`("id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId") SELECT "id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId" FROM `Transfer`;--> statement-breakpoint
DROP TABLE `Transfer`;--> statement-breakpoint
ALTER TABLE `__new_Transfer` RENAME TO `Transfer`;--> statement-breakpoint
CREATE TABLE `__new_Types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`type` text(255) DEFAULT 'custom',
	`categoryId` integer,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Types`("id", "name", "type", "categoryId") SELECT "id", "name", "type", "categoryId" FROM `Types`;--> statement-breakpoint
DROP TABLE `Types`;--> statement-breakpoint
ALTER TABLE `__new_Types` RENAME TO `Types`;--> statement-breakpoint
ALTER TABLE `Categories` ADD `iconFamily` text(255);--> statement-breakpoint
ALTER TABLE `Categories` ADD `iconName` text(255);--> statement-breakpoint
ALTER TABLE `Categories` ADD `iconColor` text(255);