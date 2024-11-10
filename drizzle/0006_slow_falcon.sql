PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Wallet` (
	`walletId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`startingBalance` real DEFAULT 0 NOT NULL,
	`walletName` text(255) DEFAULT 'My custom wallet' NOT NULL,
	`currencyCode` text(3) DEFAULT 'EUR' NOT NULL,
	`currencySymbol` text(3) DEFAULT '€' NOT NULL,
	`type` text(255) DEFAULT 'custom' NOT NULL,
	`color` text(7) DEFAULT '#3EB489' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Wallet`("walletId", "user_id", "startingBalance", "walletName", "currencyCode", "currencySymbol", "type", "color", "createdAt") SELECT "walletId", "user_id", "startingBalance", "walletName", "currencyCode", "currencySymbol", "type", "color", "createdAt" FROM `Wallet`;--> statement-breakpoint
DROP TABLE `Wallet`;--> statement-breakpoint
ALTER TABLE `__new_Wallet` RENAME TO `Wallet`;--> statement-breakpoint
PRAGMA foreign_keys=ON;