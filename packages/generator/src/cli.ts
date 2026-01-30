#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("fastrack")
  .description("Fastrack CLI: scaffold services and resources")
  .version("0.1.0");

program
  .command("new <service>")
  .description("Create a new Fastrack service")
  .action((service: string) => {
    console.log(`Creating new service: ${service}`);
    // TODO: generate service skeleton
  });

const gen = program.command("gen").description("Generate code");

gen
  .command("resource <name>")
  .description("Generate a resource (route + schema)")
  .action((name: string) => {
    console.log(`Generating resource: ${name}`);
  });

gen
  .command("controller <name>")
  .description("Generate a controller")
  .action((name: string) => {
    console.log(`Generating controller: ${name}`);
  });

gen
  .command("service <name>")
  .description("Generate a service")
  .action((name: string) => {
    console.log(`Generating service: ${name}`);
  });

gen
  .command("repository <name>")
  .description("Generate a repository")
  .option("-d, --db <mssql|oracle>", "Database type")
  .action((name: string, opts: { db?: string }) => {
    console.log(`Generating repository: ${name}`, opts.db ? `db=${opts.db}` : "");
  });

program.parse();
