import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { category } from '../db/schema/category';
import { exercise_type } from './schema/exercise_type';
import { exercise } from './schema/exercise';

const expo = SQLite.openDatabaseSync('db.db', { enableChangeListener: true });
const db = drizzle(expo);

// Database logic is kept in this file to keep the other files clean

// Checks to see if there is any data in database with a count in userList
export async function checkDatabaseState() {
  try {
    const countCategories = await db.$count(category);
    const countExerciseTypes = await db.$count(exercise_type);
    const countExercise = await db.$count(exercise);
    console.log(`👀 Current categories in the database: ${countCategories}`);
    console.log(`👀 Current exercise types in the database: ${countExerciseTypes}`);
    console.log(`👀 Current exercises in the database: ${countExercise}`);
  } catch (error) {
    console.error('❌ Error checking database state:', error);
  }
}

// Initializes the database and creates the table if it doesn't exist
export async function initializeDatabase() {
  try {
    // Use runAsync instead of execAsync for PRAGMA
    await expo.runAsync('PRAGMA foreign_keys = ON;');
    console.log('✅ Database initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error; // Re-throw to ensure the error is visible in the app
  }
}

// Temporary: Reset database for debugging
export async function resetDatabase() {
  try {
    console.log('Dropping tables...');
    await expo.runAsync('DROP TABLE IF EXISTS category;');
    await expo.runAsync('DROP TABLE IF EXISTS exercise_type;');
    await expo.runAsync('DROP TABLE IF EXISTS exercise;');
    console.log('✅ Database reset successfully.');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  }
}

export async function loadExerciseTypes() {
  try {
    await db
      .insert(exercise_type)
      .values([
        { id: 1, name: 'Reps' },
        { id: 2, name: 'Time' },
      ])
      .onConflictDoNothing({ target: exercise_type.id });
    console.log('✅ Exercise types loaded successfully');
  } catch (error) {
    console.log('❌ Error loading exercise type: ', error);
  }
}
