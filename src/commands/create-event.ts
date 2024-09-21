import { CommandInteraction, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder, Embed } from "discord.js";

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
  .setDMPermission(false);

const channelId = "1286914978305282092";

export async function execute(interaction: CommandInteraction) {
  const channel = await interaction.guild?.channels.fetch(channelId);

  if (!channel) {
    return interaction.reply("Couldn't find the event channel.");
  }

  if (interaction.isChatInputCommand() && channel instanceof TextChannel) {
    const chatInteraction = interaction as ChatInputCommandInteraction;

    const name = chatInteraction.options.getString("name", true);
    const date = chatInteraction.options.getString("date") ?? "Unknown";
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

    const thread = await (channel as TextChannel).threads.create({
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