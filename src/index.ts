import { Client, GatewayIntentBits } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";

const seenGuilds = new Set();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ],
});

client.once("ready", async () => {
  console.log("Discord bot is ready!");
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const guildId = interaction.guildId;

  // Ensure the guild gets the updated commands *somehow*
  if (!!guildId && !seenGuilds.has(guildId)) {
    seenGuilds.add(guildId);
    await deployCommands({ guildId });
  }

  const { commandName } = interaction;

  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
