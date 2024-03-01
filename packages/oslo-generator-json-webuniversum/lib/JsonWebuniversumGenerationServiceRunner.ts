import type { CliArgv } from "@oslo-core/interfaces/AppRunner";
import { AppRunner } from "@oslo-core/interfaces/AppRunner";
import yargs from "yargs";
import { container } from "@oslo-generator-json-webuniversum/config/DependencyInjectionConfig";
import type { JsonWebuniversumGenerationServiceConfiguration } from
    "@oslo-generator-json-webuniversum/config/JsonWebuniversumGenerationServiceConfiguration";
import type {
    JsonWebuniversumGenerationService,
} from "@oslo-generator-json-webuniversum/JsonWebuniversumGenerationService";

export class JsonWebuniversumGenerationServiceRunner
    extends AppRunner<JsonWebuniversumGenerationService, JsonWebuniversumGenerationServiceConfiguration> {
    public async runCli(argv: CliArgv): Promise<void> {
        const yargv = yargs(argv.slice(2))
            .usage('node ./bin/runner.js [args]')
            .option('input', { describe: 'The input file to generate a JSON-LD context from.' })
            .option('output', { describe: 'Name of the output file.', default: 'webuniversum-config.json' })
            .option('language', { describe: 'The language in which the config must be generated.' })
            .option('apTemplateMetadata', { describe: 'Markdown file with metadata for the AP template.' })
            .option('vocTemplateMetadata', { describe: 'Markdown file with metadata for the VOC template.' })
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