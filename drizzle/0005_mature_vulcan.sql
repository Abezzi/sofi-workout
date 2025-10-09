CREATE TABLE `rest_timer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`routine_exercise_id` integer,
	`exercise_set_id` integer,
	`rest_time` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE no action ON DELETE no action
);
