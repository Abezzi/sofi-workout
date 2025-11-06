PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rest_timer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`position` integer,
	`routine_id` integer NOT NULL,
	`routine_exercise_id` integer,
	`exercise_set_id` integer,
	`rest_time` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rest_timer`("id", "position", "routine_id", "routine_exercise_id", "exercise_set_id", "rest_time", "type") SELECT "id", "position", "routine_id", "routine_exercise_id", "exercise_set_id", "rest_time", "type" FROM `rest_timer`;--> statement-breakpoint
DROP TABLE `rest_timer`;--> statement-breakpoint
ALTER TABLE `__new_rest_timer` RENAME TO `rest_timer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;