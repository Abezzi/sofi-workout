ALTER TABLE `workout_set` RENAME COLUMN "weigth" TO "weight";--> statement-breakpoint
ALTER TABLE `workout_rest_timer` ADD `is_actual` integer DEFAULT false NOT NULL;