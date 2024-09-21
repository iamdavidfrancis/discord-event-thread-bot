export default interface DBSchema {
  guildSettings: { [guildId: string]: GuildSettings | undefined}
}

export interface GuildSettings {
  eventChannelId?: string;
}