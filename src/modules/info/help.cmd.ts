import { Category, categoryEmojis } from "@cmds/categories";
import { Command } from "@cmds/command";
import { Context } from "@cmds/context";
import { Registry } from "@cmds/registry";
import { createEmbed } from "@ux/embeds";

import { MessageEmbed } from "discord.js";
import { Container } from "typedi";

const registry = Container.get(Registry);

const unmappedCategoryEmojis = new Set<string>();

registry.add({
  name: "help",
  usage: "[command]",
  aliases: ["h", "commands", "cmds", "usage"],
  category: Category.Information,
  description: "Provides a list of commands to use with the bot",
  run(ctx) {
    if (ctx.args.length > 0) {
      const [key] = ctx.args;
      if (!registry.has(key)) return buildHelpMenu(ctx);
      const cmd = registry.find(key)!;
      return buildCommandHelp(ctx, cmd);
    } else {
      return buildHelpMenu(ctx);
    }
  },
});

function buildCommandHelp(ctx: Context, cmd: Command) {
  const emb = createEmbed(ctx.msg)
    .setTitle(`\`${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ""}\``)
    .setDescription(cmd.description)
    .addField("Category", cmd.category, true);

  if (Array.isArray(cmd.aliases) && cmd.aliases.length > 0) {
    emb.addField("Aliases", `\`${cmd.aliases.join("`, `")}\``, true);
  }

  return emb;
}

function buildHelpMenu(ctx: Context): MessageEmbed {
  const emb = createEmbed({
    author: ctx.msg.author,
    footerNote: `For help on how to interpret commands, run '${ctx.prefix}man syntax'`,
  })
    .setTitle(":question: Help")
    .setDescription(
      `Use \`${ctx.prefix}help [command]\` for more help on a specific command`
    );

  // Explicitly defined so that there is an order.
  const categoryInfos: Record<Category, string> = {
    [Category.Information]: "",
    [Category.Moderation]: "",
    [Category.Tools]: "",
  };

  for (const cmd of registry) {
    let cmdInfo = `\`${cmd.name}`;

    const formattedAliases =
      Array.isArray(cmd.aliases) && cmd.aliases.length > 0
        ? ` (${cmd.aliases
            .sort()
            .sort((a, b) => a.length - b.length)
            .slice(0, 2)
            .join(", ")}${cmd.aliases.length > 2 ? "..." : ""})`
        : "";

    cmdInfo += formattedAliases;
    cmdInfo += `\`: ${cmd.description}`;

    const categoryInfo = categoryInfos[cmd.category];
    const lineBreak = categoryInfo !== "" ? "\n" : "";
    categoryInfos[cmd.category] = `${categoryInfo}${lineBreak}${cmdInfo}`;
  }

  for (const [category, info] of Object.entries(categoryInfos)) {
    let emoji = categoryEmojis.get(category as Category) ?? "";
    if (emoji === "" && !unmappedCategoryEmojis.has(category)) {
      ctx.log.warn(`Category ${category} does not have an emoji assigned`);
      unmappedCategoryEmojis.add(category);
    } else {
      emoji += " ";
    }

    if (info === "") continue;

    emb.addField(`${emoji}${category}`, info);
  }

  return emb;
}