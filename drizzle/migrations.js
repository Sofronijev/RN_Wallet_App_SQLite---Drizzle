import journal from './meta/_journal.json';
import m0000 from './0000_brief_fantastic_four.sql';
import m0001 from './0001_initial_user.sql';
import m0002 from './0002_initial_wallets.sql';
import m0003 from './0003_initial_categories.sql';
import m0004 from './0004_initial_types.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004
    }
  }
  