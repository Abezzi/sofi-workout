PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer NOT NULL,
	`exercise_type_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_type_id`) REFERENCES `exercise_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercise`("id", "name", "description", "category_id", "exercise_type_id") SELECT "id", "name", "description", "category_id", "exercise_type_id" FROM `exercise`;--> statement-breakpoint
DROP TABLE `exercise`;--> statement-breakpoint
ALTER TABLE `__new_exercise` RENAME TO `exercise`;--> statement-breakpoint
PRAGMA foreign_keys=ON;