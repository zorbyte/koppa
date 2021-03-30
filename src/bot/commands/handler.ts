import { config } from "@utils/config";
import { printError } from "@utils/errors";
import { createLogger } from "@utils/logger";

import { Client, Message, MessageOptions } from "discord.js";

import { extractFromCommandString } from "./input_string_util";
import { Registry, ReturnedMessageSend } from "./registry";

export const log = createLogger("commands");

const registry = Registry.getInstance();

export function init(client: Client) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  client.on("message", async msg => {
    try {
      // Ensures the user is not a bot to prevent spam and also ensures we only handle msgs that begin with the bot prefix.
      if (msg.author.bot || !msg.content.startsWith(config.bot.prefix)) return;

      const [callKey, args] = extractFromCommandString(
        config.bot.prefix,
        msg.content
      );

      const cmd = registry.find(callKey);
      if (typeof cmd === "undefined") return;
      const cmdLog = log.child(cmd.name);
      cmdLog.debug("Command has been called", { callKey, args });

      try {
        const output = await cmd.run(msg, args, callKey);
        await handleOutput(msg, output).catch(err =>
          printError("Failed to handle output", { log: cmdLog, err })
        );
      } catch (err) {
        printError("Failed to execute", { log: cmdLog, err });
      }
    } catch (err) {
      printError("Failed to handle message event.", { log });
    }
  });
}

async function handleOutput(msg: Message, output: ReturnedMessageSend) {
  if (typeof output === "undefined") return;
  if (Array.isArray(output)) {
    return await msg.channel.send(...(output as [MessageOptions]));
  }

  await msg.channel.send(output);
}
