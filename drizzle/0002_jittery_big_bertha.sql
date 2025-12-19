ALTER TABLE `clients` MODIFY COLUMN `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `clients` ADD `whatsappEnabled` int DEFAULT 0 NOT NULL;