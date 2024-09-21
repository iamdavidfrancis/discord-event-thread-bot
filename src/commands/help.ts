import { CommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Prints a help message describing the commands.")
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("Event Thread Bot Help")
    .setDescription("The list of commands you can run with this bot.")
    .addFields(
      { name: "`/event`", value: "Allows you to create an event thread in the server specific event threads channel."},
      { name: "`/config`", value: "Allows server admins to configure this bot."},
      { name: "`/help`", value: "Prints this message."},
    )
    .setTimestamp()
    .setFooter({ text: "Created by Event Thread Bot" })
    .toJSON();

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  })
}