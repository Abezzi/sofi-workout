PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer NOT NULL,
	`exercise_type_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_type_id`) REFERENCES `exercise_type`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_exercise`("id", "name", "description", "category_id", "exercise_type_id") SELECT "id", "name", "description", "category_id", "exercise_type_id" FROM `exercise`;--> statement-breakpoint
DROP TABLE `exercise`;--> statement-breakpoint
ALTER TABLE `__new_exercise` RENAME TO `exercise`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_exercise_set` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_exercise_id` integer NOT NULL,
	`setNumber` integer NOT NULL,
	`quantity` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_exercise_set`("id", "routine_exercise_id", "setNumber", "quantity", "weight") SELECT "id", "routine_exercise_id", "setNumber", "quantity", "weight" FROM `exercise_set`;--> statement-breakpoint
DROP TABLE `exercise_set`;--> statement-breakpoint
ALTER TABLE `__new_exercise_set` RENAME TO `exercise_set`;--> statement-breakpoint
CREATE TABLE `__new_rest_timer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`routine_exercise_id` integer,
	`exercise_set_id` integer,
	`rest_time` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rest_timer`("id", "routine_id", "routine_exercise_id", "exercise_set_id", "rest_time", "type") SELECT "id", "routine_id", "routine_exercise_id", "exercise_set_id", "rest_time", "type" FROM `rest_timer`;--> statement-breakpoint
DROP TABLE `rest_timer`;--> statement-breakpoint
ALTER TABLE `__new_rest_timer` RENAME TO `rest_timer`;