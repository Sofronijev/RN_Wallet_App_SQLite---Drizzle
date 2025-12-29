import journal from './meta/_journal.json';
import m0000 from './0000_deep_centennial.sql';
import m0001 from './0001_fill_initial_user.sql';
import m0002 from './0002_fill_initial_wallets.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002
    }
  }
  