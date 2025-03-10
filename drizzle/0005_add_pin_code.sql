ALTER TABLE `Users` ADD `pinCode` text(8) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `isPinEnabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `showTotalAmount` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `inactivePinTimeout` integer DEFAULT NULL;