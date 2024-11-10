// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_flawless_reavers.sql';
import m0001 from './0001_seed-user.sql';
import m0002 from './0002_seed-wallet.sql';
import m0003 from './0003_seed-categories.sql';
import m0004 from './0004_seed-types.sql';
import m0005 from './0005_left_pet_avengers.sql';
import m0006 from './0006_slow_falcon.sql';
import m0007 from './0007_ordinary_slipstream.sql';
import m0008 from './0008_early_purifiers.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006,
m0007,
m0008
    }
  }
  