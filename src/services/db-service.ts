import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb/lib';
import { config } from '../config';
import DBSchema, { GuildSettings } from './db-schema';

class DBService {
  private db!: Low<DBSchema>;
  
  private async init() {
    console.log("Initializing DB.");

    const defaultData: DBSchema = {
      guildSettings: {},
    };

    this.db = await JSONFilePreset(config.DB_PATH, defaultData);

    await this.db.read();
    await this.db.write();
  }

  public async ensureDb() {
    if (!this.db) {
      await this.init();
    } else {
      console.log("DB is already initialized.");
    }
  }

  public getGuildSettings(guildId: string): GuildSettings {
    const settings = this.db.data.guildSettings[guildId];

    return settings ?? {};
  }

  public async addOrUpdateGuildSettings(guildId: string, settings: GuildSettings) {
    await this.db.update(({ guildSettings }) => guildSettings[guildId] = settings);
  }
}

const instance = new DBService();

export default instance;