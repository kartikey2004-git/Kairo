#!/usr/bin/env node


import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import { login, logout, whoami } from "./commands/auth/login.js";

dotenv.config();

async function main() {
  // Display banner
  console.log(
    chalk.cyan(
      figlet.textSync("Kairo CLI", {
        font: "Standard",
        horizontalLayout: "default",
      })
    )
  );

  console.log(chalk.gray("A CLI based AI tool \n"));

  const program = new Command("kairo");

  program.version("0.0.1").description("Orbital CLI - A CLI based AI Tool").addCommand(login).addCommand(logout).addCommand(whoami)

  program.action(() => {
    program.help();
  });

  program.parse();
}

main().catch((err) => {
  console.log(chalk.red("Error running kairo CLI:"), err);
  process.exit(1);
});
