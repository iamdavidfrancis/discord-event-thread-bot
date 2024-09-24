import { IDBService } from "./db-service.interface";
import { TableClient, TableEntity } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";
import { GuildSettings } from "./db-schema";
import { config } from "../config";

const PartitionKey = "DEFAULT_PARTITION";

class TableDBService implements IDBService {
  private tableClient: TableClient;
  
  constructor() {
    const credential = new DefaultAzureCredential();
    this.tableClient = new TableClient(`https://${config.STORAGE_ACCOUNT_NAME}.table.core.windows.net`, config.STORAGE_TABLE_NAME, credential);
  }

  public async getGuildSettings(guildId: string): Promise<GuildSettings> {
    try {
      const result = await this.tableClient.getEntity<TableEntity<GuildSettings>>(PartitionKey, guildId);
      
      return result;
    }
    catch (error: any) {

      if (error.statusCode !== 404) {
        console.error(error);
      }
    }

    return {};
  }

  public async addOrUpdateGuildSettings(guildId: string, settings: GuildSettings): Promise<void> {
    const entity: TableEntity<GuildSettings> = {
      partitionKey: PartitionKey,
      rowKey: guildId,
      ...settings
    }
    
    await this.tableClient.upsertEntity(entity, "Merge");
  }
}

const instance = new TableDBService();

export default instance;