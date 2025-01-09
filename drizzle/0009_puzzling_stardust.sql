PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	FOREIGN KEY (`toWalletId`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Transfer`("id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId") SELECT "id", "date", "userId", "fromWalletId", "toWalletId", "fromTransactionId", "toTransactionId" FROM `Transfer`;--> statement-breakpoint
DROP TABLE `Transfer`;--> statement-breakpoint
ALTER TABLE `__new_Transfer` RENAME TO `Transfer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;