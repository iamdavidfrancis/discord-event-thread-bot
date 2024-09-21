import { CommandInteraction, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder, Embed, InteractionContextType } from "discord.js";
import DBService from "../services/db-service";

export const data = new SlashCommandBuilder()
  .setName("event")
  .setDescription("Create a new event!")
  .addStringOption(option => 
    option
      .setName("name")
      .setDescription("The name of the event.")
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName("date")
      .setDescription("The date of the event.")
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads | PermissionFlagsBits.SendMessagesInThreads)
  .setContexts(InteractionContextType.Guild)

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guildId;

  if (!guildId) {
    console.error("The guildId was missing in the interaction.");
    return interaction.reply("Unable to process command.");
  }

  const guildSettings = await DBService.getGuildSettings(guildId);
  const { eventChannelId } = guildSettings;

  if (!eventChannelId) {
    return interaction.reply("The Channel that hosts the event threads has not yet been set. Please have an admin run `/config set-channel` to set the correct channel.");
  }

  const channel = await interaction.guild?.channels.fetch(eventChannelId);

  if (!channel) {
    return interaction.reply("Couldn't find the event channel."); 
  }

  if (interaction.isChatInputCommand() && channel instanceof TextChannel) {
    const name = interaction.options.getString("name", true);
    const date = interaction.options.getString("date") ?? "Unknown";
    const authorMention = interaction.member?.toString() ?? "Event Bot";
    const authorName = interaction.member?.user.username ?? "Event Bot";

    const eventEmbed = new EmbedBuilder()
      // .setAuthor({
      //   name: authorName,
      //   iconURL: interaction.member?.avatar ?? undefined,
      // })
      .setTitle(name)
      .setDescription(`${authorMention} created the event for ${date}`)
      .addFields(
        { name: "Event Date", value: date },
      )
      .setTimestamp()
      .setFooter({ text: "Created by Event Thread Bot" })
      .toJSON();

    const thread = await channel.threads.create({
      name: name,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      type: ChannelType.PublicThread,
      reason: "Event thread reason",
    });

    await thread.send({
      embeds: [eventEmbed]
    });

    return interaction.reply(`Thread created! ${thread.url}`);
  }
  
  return interaction.reply("Something went wrong creating the thread.");
}