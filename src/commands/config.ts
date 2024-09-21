import { ChatInputCommandInteraction, CommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import DBService from "../services/db-service";

export const data = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Update the bot config")
  .addSubcommand(subcommand => 
    subcommand
      .setName('set-channel')
      .setDescription('The channel the bot should create event threads in.')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription("The corresponding channel.")
          .setRequired(true)))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setContexts(InteractionContextType.Guild);


export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guildId;

  if (!guildId) {
    console.error("The guildId was missing in the interaction.");
    return interaction.reply("Unable to process command.");
  }

  if (interaction.isChatInputCommand()) {
    switch (interaction.options.getSubcommand()) {
      case "set-channel":
        await setChannelHandler(guildId, interaction);
        break;
      default:
        return interaction.reply(`Unknown command: ${interaction.options.getSubcommand()}`);
    }
  }
}

async function setChannelHandler(guildId: string, interaction: ChatInputCommandInteraction) {
  const guildSettings = await DBService.getGuildSettings(guildId);
  const channel = interaction.options.getChannel('channel');

  if (!channel || !guildSettings) {
    console.error("Channel or guildSettings was missing.");
    return interaction.reply("Unable to process command.");
  }

  guildSettings.eventChannelId = channel.id;

  await DBService.addOrUpdateGuildSettings(guildId, guildSettings);
  return interaction.reply(`Event Threads will now be posted under ${channel.toString()}`);
}