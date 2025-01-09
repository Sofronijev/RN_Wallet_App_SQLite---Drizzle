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
	FOREIGN KEY (`type_id`) REFERENCES `Types`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`walletId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`transfer_id`) REFERENCES `Transfer`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Transactions`("id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id", "transfer_id") SELECT "id", "amount", "description", "date", "user_id", "type_id", "categoryId", "wallet_id", "transfer_id" FROM `Transactions`;--> statement-breakpoint
DROP TABLE `Transactions`;--> statement-breakpoint
ALTER TABLE `__new_Transactions` RENAME TO `Transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;