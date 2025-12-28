ALTER TABLE `Categories` ADD `transactionType` text(20) DEFAULT 'expense' NOT NULL;--> statement-breakpoint
ALTER TABLE `Categories` ADD `sortOrder` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `Types` ADD `sortOrder` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `primaryWalletId` integer DEFAULT NULL REFERENCES Wallet(walletId);