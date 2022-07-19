
import { GeneratorConfiguration } from "@oslo-flanders/configuration";
import { Generator } from "@oslo-flanders/core";


export class ShaclValidatorConfigGenerator extends Generator<GeneratorConfiguration> {
    public async generate(data: string): Promise<void> {

        const report = JSON.parse(data);

        var key = {
            typelabel: 'validator.typeLabel.' + report["shacl"]["name"].toLowerCase().replaceAll(" ", "_"),
            url: 'validator.shaclFile.' + report["shacl"]["name"].toLowerCase().replaceAll(" ", "_") + '.remote.0.url',
            type: 'validator.shaclFile.' + report["shacl"]["name"].toLowerCase().replaceAll(" ", "_") + '.remote.0.type'
        };

        var urlvalue;
        if (report["shacl"]["path"]) {
            urlvalue = report["@id"] + "/" + report["shacl"]["path"]; //if path exist, uri = id + path
        }else if (!report["shacl"]["path"]) {
            urlvalue = report["@id"] + "/" + report["shacl"]["name"].toLowerCase().replaceAll(" ", "-") + `-${this.configuration.shaclOutput}`; //if path doesn't exist, uri = id + name + SHACL.jsonld
        }

        var value = {
            typelabel: report["shacl"]["name"],
            url: urlvalue,
            type: 'application/ld+json'
        };

        if (this.configuration.fullRebuild) {
            await this.rebuildConfig(this.configuration.shaclConfig);//rebuilds the entire config.properties file with a default configuration
        }else if (!this.configuration.fullRebuild) {
            await this.reformatTypelst(this.configuration.shaclConfig); //makes sure all types in the list are on the same line (and in the list)
        }
        await this.writeBlockToConfig(this.configuration.shaclConfig, key, value, report["shacl"]["addToConfig"]); //adds/edits new elements
        await this.reformatConfig(this.configuration.shaclConfig) //reformats the enitre config.properties file to its original form
    }

    private async writeBlockToConfig(path:string, key: any, value: any, addToConfig: boolean) { //adds/edits new elements
        var pr = require('properties-reader');
        const properties = new pr(path, {writer: { saveSections: true }});
        await properties.save(path, {writer: { saveSections: true }}); //save config file

        for (let validatorkey in properties._properties) {
            if (validatorkey.endsWith('.'+value.typelabel.toLowerCase().replaceAll(' ', '_')) && properties._properties[validatorkey].toLowerCase() == value.typelabel.toLowerCase() && String(properties.get(key.url)) != String(value.url)) { //if 2 different uri's have the same name, throw error and stop loop
                throw new Error(`${properties.get(key.url)} and ${value.url} are different URI's but have the same typelabels (${value.typelabel})`);
            }else if (validatorkey.endsWith('.0.url') && properties.get(validatorkey) == value.url) { //if uri already exists in config file, delete old data
                if (addToConfig) {
                    var label = validatorkey.split('.')[2];
                    var typelst = properties._properties['validator.type'].split(',').map((x:string) => x.trim());
                    typelst.splice(typelst.indexOf(label), 1);
                    properties.set("validator.type", typelst);

                    delete properties._properties[`validator.typeLabel.${label}`];
                    delete properties._properties[`validator.shaclFile.${label}.remote.0.url`];
                    delete properties._properties[`validator.shaclFile.${label}.remote.0.type`];
                }
            }
        }
        
        if (addToConfig) {
            if (!properties._properties['validator.type'].includes(value.typelabel.toLowerCase().replaceAll(" ", "_")))  {
                if (properties._properties['validator.type']) {
                    properties.set("validator.type", properties.get("validator.type") +  ", " + value.typelabel.toLowerCase().replaceAll(" ", "_")); //add new/updated name to type list
                }else if (!properties._properties['validator.type']) {
                    properties.set("validator.type", properties.get("validator.type") + value.typelabel.toLowerCase().replaceAll(" ", "_")); //add new/updated name to type list
                }
            }
            properties.set(key.typelabel, value.typelabel); //add new/updated data to config file
            properties.set(key.url, value.url);
            properties.set(key.type, value.type);
        }
        await properties.save(path, {writer: { saveSections: true }}); //save config file
    }

    private async rebuildConfig(path: string) { //rebuilds the entire config.properties file with a default configuration
        var defaultConfig = [
            "validator.uploadTitle: OSLO Validator",
            "validator.type: ",
            "validator.externalShapes.TYPE: true",
            "validator.supportMinimalUserInterface: true",
            "validator.channels: rest_api, soap_api",
            "validator.label.fileInputLabel: Kies het type",
            "validator.label.typeLabel: Applicatieprofiel",
            "validator.label.contentSyntaxLabel: Type serializatie",
            "validator.label.contentSyntaxTooltip: Optioneel en om serializatie van de data aan te duiden indien dit niet kan afgeleid worden vanuit het bestand of URI",
            "validator.label.uploadButton: Valideer"
        ];

        var fs = require('fs');
        try {fs.unlinkSync(path);}catch(err){return}
        finally{
            fs.writeFileSync(path,"");
    
            var pr = require('properties-reader');
            const properties = new pr(path, {writer: { saveSections: true }});

            for (let i in defaultConfig) {
                properties.set(defaultConfig[i].split(': ')[0], defaultConfig[i].split(': ')[1])
            }

            await properties.save(path, {writer: { saveSections: true }}); //save config file
        }
    }

    private async reformatConfig(path: string) { //reformats the enitre config.properties file to the original layout
        var fs = require('fs');
        var config = fs.readFileSync(path, 'utf-8').split('\n');
        const prefix = config[0].replaceAll('[', '').replaceAll(']', '');

        fs.writeFileSync(path, '');
        config.forEach((line:string) => {
            if (!(line == `[${prefix}]`))  {
                if (line.startsWith("externalShapes.TYPE")) {
                    fs.appendFileSync(path, `\n#### Validator configuration ####\n\n${prefix}.${line}\n`);
                }else if (line.startsWith('label.uploadButton')){
                    fs.appendFileSync(path, `${prefix}.${line}\n\n\n#############################################\n`);
                }else if (line.startsWith('typeLabel')){
                    fs.appendFileSync(path, `\n###Config API ${line.split('=')[1].trim()}###\n${prefix}.${line}\n`);
                }else {
                    fs.appendFileSync(path, `${prefix}.${line}\n`);
                }
            }
        });
    }

    private async reformatTypelst(path: string) { //makes sure all types in the list are on the same line (and in the list)
        var fs = require('fs');
        var pr = require('properties-reader');
        const properties = new pr(path, {writer: { saveSections: true }});
        var config = fs.readFileSync(path, 'utf-8').split('\n');

        config.forEach((line:string) => {
            if (line &&!line.startsWith('[validator]') && !line.startsWith('validator.') &&  !line.startsWith('#'))  {
                properties.set("validator.type", properties._properties["validator.type"]+' '+line);
                delete properties._properties[line];
            }
        });
        await properties.save(path, {writer: { saveSections: true }}); //save config file
    }
}
