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
var Table_exports = {};
__export(Table_exports, {
  Table: () => Table
});
module.exports = __toCommonJS(Table_exports);
var import_index = require("./index.js");
var import_column = require("./column.js");
var import_data = require("./data/index.js");
var import_Database = require("./Database.js");
var import_PageType = require("./PageType.js");
var import_unicodeCompression = require("./unicodeCompression.js");
var import_usage_map = require("./usage-map.js");
var import_util = require("./util.js");
class Table {
  #name;
  #database;
  #firstDefinitionPage;
  #definitionBuffer;
  #dataPages;
  /**
   * Number of rows.
   */
  #rowCount;
  /**
   * Number of columns.
   */
  #columnCount;
  #variableColumnCount;
  // #fixedColumnCount: number;
  // #logicalIndexCount: number;
  #realIndexCount;
  /**
   * @param name Table name. As this is stored in a MSysObjects, it has to be passed in
   * @param database
   * @param firstDefinitionPage The first page of the table definition referenced in the corresponding MSysObject
   */
  constructor(name, database, firstDefinitionPage) {
    this.#name = name;
    this.#database = database;
    this.#firstDefinitionPage = firstDefinitionPage;
    let nextDefinitionPage = this.#firstDefinitionPage;
    let buffer;
    while (nextDefinitionPage > 0) {
      const curBuffer = this.#database.getPage(nextDefinitionPage);
      (0, import_PageType.assertPageType)(curBuffer, import_PageType.PageType.TableDefinition);
      if (!buffer) {
        buffer = curBuffer;
      } else {
        buffer = Buffer.concat([buffer, curBuffer.slice(8)]);
      }
      nextDefinitionPage = curBuffer.readUInt32LE(4);
    }
    if (!buffer) {
      throw new Error("Could not find table definition page");
    }
    this.#definitionBuffer = buffer;
    this.#rowCount = this.#definitionBuffer.readUInt32LE(this.#database.format.tableDefinitionPage.rowCountOffset);
    this.#columnCount = this.#definitionBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.columnCountOffset);
    this.#variableColumnCount = this.#definitionBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.variableColumnCountOffset);
    this.#realIndexCount = this.#definitionBuffer.readInt32LE(this.#database.format.tableDefinitionPage.realIndexCountOffset);
    const usageMapBuffer = this.#database.findPageRow(this.#definitionBuffer.readUInt32LE(this.#database.format.tableDefinitionPage.usageMapOffset));
    this.#dataPages = (0, import_usage_map.findMapPages)(usageMapBuffer, this.#database);
  }
  get name() {
    return this.#name;
  }
  get rowCount() {
    return this.#rowCount;
  }
  get columnCount() {
    return this.#columnCount;
  }
  /**
   * Returns a column definition by its name.
   *
   * @param name Name of the column. Case sensitive.
   */
  getColumn(name) {
    const column = this.getColumns().find((c) => c.name === name);
    if (column === void 0) {
      throw new Error(`Could not find column with name ${name}`);
    }
    return column;
  }
  /**
   * Returns an ordered array of all column definitions.
   */
  getColumns() {
    const columnDefinitions = this.#getColumnDefinitions();
    columnDefinitions.sort((a, b) => a.index - b.index);
    return columnDefinitions.map(({ index, variableIndex, fixedIndex, ...rest }) => rest);
  }
  #getColumnDefinitions() {
    const columns = [];
    let curDefinitionPos = this.#database.format.tableDefinitionPage.realIndexStartOffset + this.#realIndexCount * this.#database.format.tableDefinitionPage.realIndexEntrySize;
    let namesCursorPos = curDefinitionPos + this.#columnCount * this.#database.format.tableDefinitionPage.columnsDefinition.entrySize;
    for (let i = 0; i < this.#columnCount; ++i) {
      const columnBuffer = this.#definitionBuffer.slice(curDefinitionPos, curDefinitionPos + this.#database.format.tableDefinitionPage.columnsDefinition.entrySize);
      const type = (0, import_column.getColumnType)(this.#definitionBuffer.readUInt8(curDefinitionPos + this.#database.format.tableDefinitionPage.columnsDefinition.typeOffset));
      const nameLength = this.#definitionBuffer.readUIntLE(namesCursorPos, this.#database.format.tableDefinitionPage.columnNames.nameLengthSize);
      namesCursorPos += this.#database.format.tableDefinitionPage.columnNames.nameLengthSize;
      const name = (0, import_unicodeCompression.uncompressText)(this.#definitionBuffer.slice(namesCursorPos, namesCursorPos + nameLength), this.#database.format);
      namesCursorPos += nameLength;
      const column = {
        name,
        type,
        index: columnBuffer.readUInt8(this.#database.format.tableDefinitionPage.columnsDefinition.indexOffset),
        variableIndex: columnBuffer.readUInt8(this.#database.format.tableDefinitionPage.columnsDefinition.variableIndexOffset),
        size: type === import_index.ColumnTypes.Boolean ? 0 : columnBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.columnsDefinition.sizeOffset),
        fixedIndex: columnBuffer.readUInt16LE(this.#database.format.tableDefinitionPage.columnsDefinition.fixedIndexOffset),
        ...(0, import_column.parseColumnFlags)(columnBuffer.readUInt8(this.#database.format.tableDefinitionPage.columnsDefinition.flagsOffset))
      };
      if (type === import_index.ColumnTypes.Numeric) {
        column.precision = columnBuffer.readUInt8(11);
        column.scale = columnBuffer.readUInt8(12);
      }
      columns.push(column);
      curDefinitionPos += this.#database.format.tableDefinitionPage.columnsDefinition.entrySize;
    }
    return columns;
  }
  /**
   * Returns an ordered array of all column names.
   */
  getColumnNames() {
    return this.getColumns().map((column) => column.name);
  }
  /**
   * Returns data from the table.
   *
   * @param columns Columns to be returned. Defaults to all columns.
   * @param rowOffset Index of the first row to be returned. 0-based. Defaults to 0.
   * @param rowLimit Maximum number of rows to be returned. Defaults to Infinity.
   */
  getData(options = {}) {
    const columnDefinitions = this.#getColumnDefinitions();
    const data = [];
    const columns = columnDefinitions.filter((c) => options.columns === void 0 || options.columns.includes(c.name));
    let rowsToSkip = options?.rowOffset ?? 0;
    let rowsToRead = options?.rowLimit ?? Infinity;
    for (const dataPage of this.#dataPages) {
      if (rowsToRead <= 0) {
        break;
      }
      const pageBuffer = this.#getDataPage(dataPage);
      const recordOffsets = this.#getRecordOffsets(pageBuffer);
      if (recordOffsets.length <= rowsToSkip) {
        rowsToSkip -= recordOffsets.length;
        continue;
      }
      const recordOffsetsToLoad = recordOffsets.slice(rowsToSkip, rowsToSkip + rowsToRead);
      const recordsOnPage = this.#getDataFromPage(pageBuffer, recordOffsetsToLoad, columns);
      data.push(...recordsOnPage);
      rowsToRead -= recordsOnPage.length;
      rowsToSkip = 0;
    }
    return data;
  }
  #getDataPage(page) {
    const pageBuffer = this.#database.getPage(page);
    (0, import_PageType.assertPageType)(pageBuffer, import_PageType.PageType.DataPage);
    if (pageBuffer.readUInt32LE(4) !== this.#firstDefinitionPage) {
      throw new Error(`Data page ${page} does not belong to table ${this.#name}`);
    }
    return pageBuffer;
  }
  #getRecordOffsets(pageBuffer) {
    const recordCount = pageBuffer.readUInt16LE(this.#database.format.dataPage.recordCountOffset);
    const recordOffsets = [];
    for (let record = 0; record < recordCount; ++record) {
      const offsetMask = 8191;
      let recordStart = pageBuffer.readUInt16LE(this.#database.format.dataPage.record.countOffset + 2 + record * 2);
      if (recordStart & 16384) {
        continue;
      }
      recordStart &= offsetMask;
      const nextStart = record === 0 ? this.#database.format.pageSize : pageBuffer.readUInt16LE(this.#database.format.dataPage.record.countOffset + record * 2) & offsetMask;
      const recordLength = nextStart - recordStart;
      const recordEnd = recordStart + recordLength - 1;
      recordOffsets.push([recordStart, recordEnd]);
    }
    return recordOffsets;
  }
  #getDataFromPage(pageBuffer, recordOffsets, columns) {
    const lastColumnIndex = Math.max(...columns.map((c) => c.index), 0);
    const data = [];
    for (const [recordStart, recordEnd] of recordOffsets) {
      const rowColumnCount = pageBuffer.readUIntLE(recordStart, this.#database.format.dataPage.record.columnCountSize);
      const bitmaskSize = (0, import_util.roundToFullByte)(rowColumnCount);
      let rowVariableColumnCount = 0;
      const variableColumnOffsets = [];
      if (this.#variableColumnCount > 0) {
        switch (this.#database.format.dataPage.record.variableColumnCountSize) {
          case 1: {
            rowVariableColumnCount = pageBuffer.readUInt8(recordEnd - bitmaskSize);
            const recordLength = recordEnd - recordStart + 1;
            let jumpCount = Math.floor((recordLength - 1) / 256);
            const columnPointer = recordEnd - bitmaskSize - jumpCount - 1;
            if ((columnPointer - recordStart - rowVariableColumnCount) / 256 < jumpCount) {
              --jumpCount;
            }
            let jumpsUsed = 0;
            for (let i = 0; i < rowVariableColumnCount + 1; ++i) {
              while (jumpsUsed < jumpCount && i === pageBuffer.readUInt8(recordEnd - bitmaskSize - jumpsUsed - 1)) {
                ++jumpsUsed;
              }
              variableColumnOffsets.push(pageBuffer.readUInt8(columnPointer - i) + jumpsUsed * 256);
            }
            break;
          }
          case 2: {
            rowVariableColumnCount = pageBuffer.readUInt16LE(recordEnd - bitmaskSize - 1);
            for (let i = 0; i < rowVariableColumnCount + 1; ++i) {
              variableColumnOffsets.push(pageBuffer.readUInt16LE(recordEnd - bitmaskSize - 3 - i * 2));
            }
            break;
          }
        }
      }
      const rowFixedColumnCount = rowColumnCount - rowVariableColumnCount;
      const nullMask = pageBuffer.slice(recordEnd - bitmaskSize + 1, recordEnd - bitmaskSize + 1 + (0, import_util.roundToFullByte)(lastColumnIndex + 1));
      let fixedColumnsFound = 0;
      const recordValues = {};
      for (const column of [...columns].sort((a, b) => a.index - b.index)) {
        let value = void 0;
        let start;
        let size;
        if (!(0, import_util.getBitmapValue)(nullMask, column.index)) {
          value = null;
        }
        if (column.fixedLength && fixedColumnsFound < rowFixedColumnCount) {
          const colStart = column.fixedIndex + this.#database.format.dataPage.record.columnCountSize;
          start = recordStart + colStart;
          size = column.size;
          ++fixedColumnsFound;
        } else if (!column.fixedLength && column.variableIndex < rowVariableColumnCount) {
          const colStart = variableColumnOffsets[column.variableIndex];
          start = recordStart + colStart;
          size = variableColumnOffsets[column.variableIndex + 1] - colStart;
        } else {
          start = 0;
          value = null;
          size = 0;
        }
        if (column.type === import_index.ColumnTypes.Boolean) {
          value = value === void 0;
        } else if (value !== null) {
          value = (0, import_data.readFieldValue)(pageBuffer.slice(start, start + size), column, this.#database);
        }
        recordValues[column.name] = value;
      }
      data.push(recordValues);
    }
    return data;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Table
});
