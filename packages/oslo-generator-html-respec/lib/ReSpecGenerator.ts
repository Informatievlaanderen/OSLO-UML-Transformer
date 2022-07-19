import { GeneratorConfiguration } from "@oslo-flanders/configuration";
import { Generator } from "@oslo-flanders/core";
import { writeFileSync } from "fs";
import { resolve } from "path";
import * as nj from "nunjucks";


export class ReSpecGenerator extends Generator<GeneratorConfiguration> {

  public async generate(data: string): Promise<void> {
    const report = JSON.parse(data)
    const reportclasses = report["classes"]

    const templateDir = resolve(`${__dirname}/../respec`);
    nj.configure(templateDir, {autoescape: false});

    const classes = this.parseClasses(reportclasses)

    const html = nj.render(`templates/template-${this.configuration.language}.njk`, { respec_config: this.getRespecConfig(report), classes, page_title: 'test' });
    writeFileSync(`${__dirname}/../respec/rendered-template.html`, html);
  }

  private parseClasses(reportclasses: any[]) {
    return reportclasses.map(_class => {
      const id = _class["@id"];
      const label = _class["label"][0]["@value"];
      const definition = _class["definition"][0]["@value"];
      var usageNote;
      var parent;

      if (_class["usageNote"]) {
        usageNote = _class["usageNote"][0]["@value"]
      }
      if (_class["parent"]) {
        parent = _class["parent"][0]["@id"]
        for (let id in _class["parent"]) {
          if (parseInt(id) >= 1) {
            parent += "\n" + _class["parent"][parseInt(id)]["@id"]
          }
        }
      }

      return {
        id,
        label,
        definition,
        usageNote,
        parent
      }
    });
  }

  private getRespecConfig(report: any) {
    var editorslst = [];
    for (let element in report["editors"]) {
      editorslst.push({name: report["editors"][element]["@id"].toString(), url: report["editors"][element]["baseUri"]})
    }

    const config = {
      specStatus: 'unofficial',
      editors: editorslst,
      github: 'w3c/respec',
      shortName: 'respec',
      xref: 'web-platform',
      group: 'webapps',
    };
  
    return `
      <script class="remove" >
        var respecConfig = ${JSON.stringify(config)}
      </script>
    `;
  }
}