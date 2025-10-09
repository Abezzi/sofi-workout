// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_windy_lilandra.sql';
import m0001 from './0001_ancient_sentry.sql';
import m0002 from './0002_wandering_lady_mastermind.sql';
import m0003 from './0003_cute_madrox.sql';
import m0004 from './0004_faulty_expediter.sql';
import m0005 from './0005_mature_vulcan.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  