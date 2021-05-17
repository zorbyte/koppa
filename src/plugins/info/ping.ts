import { Registry } from "@cmds/registry";
import { KoppaClient } from "@core/client";
import { createEmbed } from "@ux/embeds";

import { Container } from "typedi";

const registry = Container.get(Registry);
const client = Container.get(KoppaClient);

registry.add({
  name: "ping",
  aliases: ["p", "latency"],
  async run({ msg }) {
    const m = await msg.channel.send("Ping?");
    const pingTime = Math.abs(m.createdTimestamp - msg.createdTimestamp);

    const respEmbed = createEmbed({
      author: msg.author,
      footerNote: `Latency: ${client.ws.ping}ms`,
    })
      .setTitle(":ping_pong: Pong!")
      .setDescription(`It took **${pingTime}ms** to send this message.`);

    await m.edit("", respEmbed);
  },
});