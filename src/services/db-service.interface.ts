import { GuildSettings } from './db-schema';

export interface IDBService {
  getGuildSettings(guildId: string): Promise<GuildSettings | undefined>;

  addOrUpdateGuildSettings(guildId: string, settings: GuildSettings): Promise<void>;
}