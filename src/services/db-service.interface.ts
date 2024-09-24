import { GuildSettings } from './db-schema';

export interface IDBService {
  getGuildSettings(guildId: string): Promise<GuildSettings>;

  addOrUpdateGuildSettings(guildId: string, settings: GuildSettings): Promise<void>;
}