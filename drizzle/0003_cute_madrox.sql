CREATE TABLE `exercise_set ` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_exercise_id` integer NOT NULL,
	`setNumber` integer NOT NULL,
	`quantity` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE no action
);
