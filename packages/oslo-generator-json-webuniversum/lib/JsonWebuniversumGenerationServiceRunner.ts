import type { CliArgv } from "@oslo-flanders/core";
import { AppRunner } from "@oslo-flanders/core";
import yargs from "yargs";
import { container } from "./config/DependencyInjectionConfig";
import type { JsonWebuniversumGenerationServiceConfiguration } from
    "./config/JsonWebuniversumGenerationServiceConfiguration";
import type {
    JsonWebuniversumGenerationService,
} from "./JsonWebuniversumGenerationService";

export class JsonWebuniversumGenerationServiceRunner
    extends AppRunner<JsonWebuniversumGenerationService, JsonWebuniversumGenerationServiceConfiguration> {
    public async runCli(argv: CliArgv): Promise<void> {
        const yargv = yargs(argv.slice(2))
            .usage('node ./bin/runner.js [args]')
            .option('input', { describe: 'The input file to generate a Webuniversum config from.' })
            .option('output', { describe: 'Name of the output file.', default: 'webuniversum-config.json' })
            .option('language', { describe: 'The language in which the config must be generated.' })
            .option('silent',
                {
                    describe: 'All logs are suppressed',
                    default: false,
                    boolean: true,
                })
            .demandOption(['input', 'language'])
            .help('h')
            .alias('h', 'help');

        const params = await yargv.parse();
        this.startApp(params, container).catch(error => console.error(error));
    }
}