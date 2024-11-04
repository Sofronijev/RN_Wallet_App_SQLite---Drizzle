PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real,
	`description` text(255),
	`date` text DEFAULT CURRENT_TIMESTAMP,
	`user_id` integer DEFAULT 1,
	`type_id` integer,
	`categoryId` integer,
	`wallet_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Transactions`("id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id") SELECT "id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id" FROM `Transactions`;--> statement-breakpoint
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
	FOREIGN KEY (`fromWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`fromTransactionId`) REFERENCES `Transactions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toTransactionId`) REFERENCES `Transactions`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Transfer`("id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId") SELECT "id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId" FROM `Transfer`;--> statement-breakpoint
DROP TABLE `Transfer`;--> statement-breakpoint
ALTER TABLE `__new_Transfer` RENAME TO `Transfer`;--> statement-breakpoint
CREATE TABLE `__new_Wallet` (
	`walletId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer DEFAULT 1,
	`startingBalance` real DEFAULT 0,
	`walletName` text(255) DEFAULT 'My custom wallet',
	`currencyCode` text(3) DEFAULT 'EUR',
	`currencySymbol` text(3) DEFAULT '€',
	`type` text(255) DEFAULT 'custom',
	`color` text(7) DEFAULT '#3EB489',
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Wallet`("walletId", "user_id", "startingBalance", "walletName", "currencyCode", "currencySymbol", "type", "color", "createdAt") SELECT "walletId", "user_id", "startingBalance", "walletName", "currencyCode", "currencySymbol", "type", "color", "createdAt" FROM `Wallet`;--> statement-breakpoint
DROP TABLE `Wallet`;--> statement-breakpoint
ALTER TABLE `__new_Wallet` RENAME TO `Wallet`;