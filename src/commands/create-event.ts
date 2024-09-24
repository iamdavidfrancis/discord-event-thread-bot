import { CommandInteraction, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder, Embed, InteractionContextType } from "discord.js";
import DBService from "../services/table-db-service";

export const data = new SlashCommandBuilder()
  .setName("event")
  .setDescription("Create a new event!")
  .addStringOption(option => 
    option
      .setName("name")
      .setDescription("The name of the event.")
      .setRequired(true))
  .addAttachmentOption(option =>
    option
      .setName("attachment")
      .setDescription("An attachment for the event. (Think like a flyer or similar)")
      .setRequired(false))
  .addStringOption(option =>
    option
      .setName("date")
      .setDescription("The date of the event.")
      .setRequired(false))
  .addStringOption(option =>
    option
      .setName("description")
      .setDescription("The event description.")
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads | PermissionFlagsBits.SendMessagesInThreads | PermissionFlagsBits.AddReactions)
  .setContexts(InteractionContextType.Guild)

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guildId;

  if (!guildId) {
    console.error("The guildId was missing in the interaction.");
    return interaction.reply("Unable to process command.");
  }

  const guildSettings = await DBService.getGuildSettings(guildId);

  if (!guildSettings) {
    return interaction.reply("The Channel that hosts the event threads has not yet been set. Please have an admin run `/config set-channel` to set the correct channel.");
  }


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
    const description = interaction.options.getString("description");
    const date = interaction.options.getString("date") ?? "Unknown";
    const authorMention = interaction.member?.toString() ?? "Event Bot";
    const attachment = interaction.options.getAttachment("attachment");
    const authorName = interaction.member?.user.username ?? "Event Bot";

    let eventEmbed = new EmbedBuilder()
      // .setAuthor({
      //   name: authorName,
      //   iconURL: interaction.member?.avatar ?? undefined,
      // })
      .setTitle(name)
      .setDescription(!!description ? description : `${authorMention} created the event for ${date}`)
      .addFields(
        { name: "Host", value: authorMention },
        { name: "Event Date", value: date },
        { name: "Plan on Attending?", value: "Please react to this message if you're planning on attending.\n:white_check_mark: I'm attending\n:grey_question: I might attend\n:x: I can't attend"}
      )
      .setTimestamp()
      .setFooter({ text: "Created by Event Thread Bot" })
    
    if (!!attachment) {
      console.log(JSON.stringify(attachment));
      eventEmbed = eventEmbed.setImage(attachment.url);
    }
      
    const embed = eventEmbed.toJSON();

    const thread = await channel.threads.create({
      name: name,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      type: ChannelType.PublicThread,
      reason: "Event thread reason",
    });

    const message = await thread.send({
      embeds: [embed]
    });
    
    await Promise.all([
      message.react('✅'),
      message.react('❔'),
      message.react('❌'),
      // message.pin(),
    ]);

    return interaction.reply(`Thread created! ${thread.url}`);
  }
  
  return interaction.reply("Something went wrong creating the thread.");
}