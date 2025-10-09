ALTER TABLE `exercise_set ` RENAME TO `exercise_set`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise_set` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_exercise_id` integer NOT NULL,
	`setNumber` integer NOT NULL,
	`quantity` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercise_set`("id", "routine_exercise_id", "setNumber", "quantity", "weight") SELECT "id", "routine_exercise_id", "setNumber", "quantity", "weight" FROM `exercise_set`;--> statement-breakpoint
DROP TABLE `exercise_set`;--> statement-breakpoint
ALTER TABLE `__new_exercise_set` RENAME TO `exercise_set`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `routine` ADD `rest_mode` text NOT NULL;