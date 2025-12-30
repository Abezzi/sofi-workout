// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_natural_ultimo.sql';
import m0001 from './0001_curly_red_ghost.sql';
import m0002 from './0002_aromatic_leader.sql';
import m0003 from './0003_ambiguous_the_order.sql';
import m0004 from './0004_heavy_morph.sql';
import m0005 from './0005_curly_iron_monger.sql';

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
  