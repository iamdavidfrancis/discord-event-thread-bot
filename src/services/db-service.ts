import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb/lib';
import { config } from '../config';
import { IDBService } from './db-service.interface';
import DBSchema, { GuildSettings } from './db-schema';

class DBService implements IDBService {
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

  public async getGuildSettings(guildId: string): Promise<GuildSettings> {
    const settings = this.db.data.guildSettings[guildId];

    return settings ?? {};
  }

  public async addOrUpdateGuildSettings(guildId: string, settings: GuildSettings) {
    await this.db.update(({ guildSettings }) => guildSettings[guildId] = settings);
  }
}

const instance = new DBService();

export default instance;