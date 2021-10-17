/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-17 19:04:34
 * @Description:
 * @LastEditTime: 2021-10-17 20:30:05
 * @LastEditors: HaoTian Qi
 */

import { p, deepCopy, posToIndex } from "./util";

const errorCode = {
  tableGridUndefined: 0,
  tableGridRepeated: 1,
  tableBindIllegal: 2
};

const codeMessage = ["tableGridUndefined", "tableGridRepeated", "tableBindIllegal"];

class Exception {
  constructor(code, location) {
    this.code = codeMessage[code];
    this.message = code;

    this.location = deepCopy(location);
  }
}

export class Result {
  constructor() {
    this.errors = [];
    this.warns = [];
  }
  get isEmpty() {
    return this.errors.length == 0 && this.warns.length == 0;
  }
  addError(code, location) {
    let e = new Exception(code, location);
    this.errors.push(e);
  }
  addWarn(code, location) {
    let e = new Exception(code, location);
    this.warns.push(e);
  }
  get toObject() {
    return { errors: this.errors, warns: this.warns };
  }
}

export function check(exp) {
  let result = new Result();
  let loc = [];

  //   loc.push("ui");
  // todo loc
  for (const uiItem of exp["ui"]) {
    switch (uiItem["type"]) {
      case "table":
        let grids = [];
        for (let j = 0; j < uiItem["properties"]["width"] * uiItem["properties"]["height"]; j++) {
          grids.push(0);
        }
        for (const bind of uiItem["properties"]["binds"]) {
          function processG(x, y) {
            let index = posToIndex(x, y, uiItem["properties"]["width"]);
            if (grids[index] == 1) {
              result.addError(errorCode.tableGridRepeated, []);
            } else {
              grids[index] = 1;
            }
          }

          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            processG(x, y);
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
              let y = bind["start"][1] + j;
              processG(x, y);
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
              let x = bind["start"][0] + j;
              processG(x, y);
            }
          } else {
            result.addError(errorCode.tableBindIllegal, []);
          }
        }
        for (let j = 0; j < uiItem["properties"]["width"] * uiItem["properties"]["height"]; j++) {
          if (grids[j] == 0) {
            result.addWarn(errorCode.tableGridUndefined, []);
          }
        }
    }
  }

  return result;
}
