CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer NOT NULL,
	`exercise_type_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_type_id`) REFERENCES `exercise_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`rest_mode` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_set` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_exercise_id` integer NOT NULL,
	`setNumber` integer NOT NULL,
	`quantity` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rest_timer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`routine_exercise_id` integer,
	`exercise_set_id` integer,
	`rest_time` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine_exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE no action ON DELETE no action
);
