"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var MDBReader_exports = {};
__export(MDBReader_exports, {
  default: () => MDBReader
});
module.exports = __toCommonJS(MDBReader_exports);
var import_Database = require("./Database.js");
var import_PageType = require("./PageType.js");
var import_SysObject = require("./SysObject.js");
var import_Table = require("./Table.js");
const MSYS_OBJECTS_TABLE = "MSysObjects";
const MSYS_OBJECTS_PAGE = 2;
class MDBReader {
  #buffer;
  #sysObjects;
  #database;
  /**
   * @param buffer Buffer of the database.
   */
  constructor(buffer, { password } = {}) {
    this.#buffer = buffer;
    (0, import_PageType.assertPageType)(this.#buffer, import_PageType.PageType.DatabaseDefinitionPage);
    this.#database = new import_Database.Database(this.#buffer, password ?? "");
    const mSysObjectsTable = new import_Table.Table(MSYS_OBJECTS_TABLE, this.#database, MSYS_OBJECTS_PAGE).getData({
      columns: ["Id", "Name", "Type", "Flags"]
    });
    this.#sysObjects = mSysObjectsTable.map((mSysObject) => {
      const objectType = mSysObject.Type & 127;
      return {
        objectName: mSysObject.Name,
        objectType: (0, import_SysObject.isSysObjectType)(objectType) ? objectType : null,
        tablePage: mSysObject.Id & 16777215,
        flags: mSysObject.Flags
      };
    });
  }
  /**
   * Date when the database was created
   */
  getCreationDate() {
    return this.#database.getCreationDate();
  }
  /**
   * Database password
   */
  getPassword() {
    return this.#database.getPassword();
  }
  /**
   * Default sort order
   */
  getDefaultSortOrder() {
    return this.#database.getDefaultSortOrder();
  }
  /**
   * Returns an array of table names.
   *
   * @param normalTables Includes user tables. Default true.
   * @param systemTables Includes system tables. Default false.
   * @param linkedTables Includes linked tables. Default false.
   */
  getTableNames({ normalTables = true, systemTables = false, linkedTables = false } = {}) {
    const filteredSysObjects = [];
    for (const sysObject of this.#sysObjects) {
      if (sysObject.objectType === import_SysObject.SysObjectTypes.Table) {
        if (!(0, import_SysObject.isSystemObject)(sysObject)) {
          if (normalTables) {
            filteredSysObjects.push(sysObject);
          }
        } else if (systemTables) {
          filteredSysObjects.push(sysObject);
        }
      } else if (sysObject.objectType === import_SysObject.SysObjectTypes.LinkedTable && linkedTables) {
        filteredSysObjects.push(sysObject);
      }
    }
    return filteredSysObjects.map((o) => o.objectName);
  }
  /**
   * Returns a table by its name.
   *
   * @param name Name of the table. Case sensitive.
   */
  getTable(name) {
    const sysObject = this.#sysObjects.filter((o) => o.objectType === import_SysObject.SysObjectTypes.Table).find((o) => o.objectName === name);
    if (!sysObject) {
      throw new Error(`Could not find table with name ${name}`);
    }
    return new import_Table.Table(name, this.#database, sysObject.tablePage);
  }
}
