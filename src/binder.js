// TODO UI 限制小数位数
const mathjs = require("mathjs");
const math = mathjs.create(mathjs.all, { number: "BigNumber" });

import { execute } from "./executor";
import { p, deepCopy, posToIndex, IndexToPos } from "./util";

// 展开 Grids，一维变二维
function tableGridsFlat(items) {
  items = deepCopy(items);
  for (const item of items) {
    if (item["type"] == "table") {
      let columns = [];
      for (let i = 0; i < item["properties"]["width"]; i++) {
        columns.push({ id: i, grids: [] });
      }
      for (const g of item["properties"]["grids"]) {
        let index = g["id"];
        let { x, y } = IndexToPos(index, item["properties"]["width"]);
        columns[y - 1]["grids"][x - 1] = g;
      }
      item["properties"]["columns"] = columns;
      delete item.properties.grids;
    }
  }
  return items;
}

// 合并 Grids，二维变一维
function tableGridsConcat(items) {
  items = deepCopy(items);
  for (const item of items) {
    if (item["type"] == "table") {
      let grids = [];
      for (const gArray of item["properties"]["columns"]) {
        for (const g of gArray["grids"]) {
          let index = g["id"];
          grids[index] = g;
        }
      }
      item["properties"]["grids"] = grids;
    }
  }
  return items;
}

function getDictNameVariable(variables) {
  let dictNameVariable = {};
  for (const variable of variables) {
    dictNameVariable[variable["name"]] = variable;
  }
  return dictNameVariable;
}

export class Binder {
  constructor(experiment) {
    this.experiment = experiment;
    this.dictNameVariable = getDictNameVariable(experiment["logic"]["variables"]);
  }
  /**
   * 根据 Binder 的 experiment 获取 labItems
   *
   * @param {boolean} tableInputHasDefaultValue table 组件中 变量输入格 是否有 default。初始化时，传入 true。实现一键清空时，传入 false。
   * @return {Object} 返回 labItems
   */
  getLabItems(tableInputHasDefaultValue = true) {
    let experiment = deepCopy(this.experiment);

    const dictNameVariable = getDictNameVariable(experiment["logic"]["variables"]);

    let labItems = [];

    for (const expItem of experiment["ui"]) {
      let labItem = { properties: expItem["properties"], type: expItem["type"] }; // 1个 lab-item 组件 对应的数据

      switch (expItem["type"]) {
        case "input":
          let name = expItem["properties"]["variableName"];
          labItem["properties"]["default"] = math.format(dictNameVariable[name]["source"]["default"], {
            notation: "fixed"
          });
          labItem["properties"]["value"] = "";
          break;
        case "output":
          labItem["properties"]["value"] = "#";
          break;
        case "textbox":
          break;
        case "table":
          let grids = [];
          for (let j = 0; j < expItem["properties"]["width"] * expItem["properties"]["height"]; j++) {
            grids.push({ id: j, type: "undefined" });
            // 单元格 type : input output constant
          }
          for (const bind of expItem["properties"]["binds"]) {
            let type;

            let defaultValue;
            switch (bind["type"]) {
              case "variable":
                if (dictNameVariable[bind["name"]]["source"]["type"] == "input") {
                  type = "input";
                  defaultValue = dictNameVariable[bind["name"]]["source"]["default"];
                  if (!tableInputHasDefaultValue) {
                    if (Array.isArray(defaultValue)) {
                      defaultValue = defaultValue.map(() => "");
                    } else {
                      defaultValue = "";
                    }
                  } else {
                    defaultValue = defaultValue.map((item) => math.format(item, { notation: "fixed" }));
                  }
                } else {
                  type = "output";
                }
                break;
              case "constant":
                type = "constant";
                defaultValue = bind["value"];
                break;
              default:
                console.error("unsupport bind type", bind);
            }

            function processG(x, y, v) {
              let g = grids[posToIndex(x, y, expItem["properties"]["width"])];

              g["type"] = type;
              switch (type) {
                case "input":
                  g["default"] = v;
                  g["value"] = "";
                  break;
                case "output":
                  g["value"] = "#";
                  break;
                case "constant":
                  g["value"] = v;
                  break;
              }
            }

            if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
              let x = bind["start"][0];
              let y = bind["start"][1];
              processG(x, y, defaultValue);
            } else if (bind["start"][0] == bind["end"][0]) {
              let x = bind["start"][0];
              for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
                let y = bind["start"][1] + j;
                processG(x, y, defaultValue ? defaultValue[j] : undefined);
              }
            } else if (bind["start"][1] == bind["end"][1]) {
              let y = bind["start"][1];
              for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
                let x = bind["start"][0] + j;
                processG(x, y, defaultValue ? defaultValue[j] : undefined);
              }
            } else {
              console.error("start end 不合法", bind);
            }
          }
          labItem["properties"]["grids"] = grids;
          delete labItem.properties.binds;
          break;
        default:
          console.error("unsupport UI type", x);
      }

      labItems.push(labItem);
    }

    for (let i = 0; i < labItems.length; i++) {
      labItems[i]["id"] = i;
    }

    labItems = tableGridsFlat(labItems);
    return labItems;
  }

  getStdInput(labItems) {
    labItems = tableGridsConcat(labItems);

    let stdInput = {};

    labItems.forEach((c, i) => {
      if (c["type"] == "input") {
        stdInput[c["properties"]["variableName"]] = c["properties"]["value"]
          ? c["properties"]["value"]
          : c["properties"]["default"];
      } else if (c["type"] == "table") {
        for (const bind of this.experiment["ui"][i]["properties"]["binds"]) {
          if (bind["type"] != "variable" || this.dictNameVariable[bind["name"]]["source"]["type"] != "input") {
            continue;
          }
          let value = [];

          function getGridValue(x, y) {
            let g = c["properties"]["grids"][posToIndex(x, y, c["properties"]["width"])];
            let v = g["value"] ? g["value"] : g["default"];
            return v;
          }

          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            value = getGridValue(x, y);
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
              let y = bind["start"][1] + j;
              value.push(getGridValue(x, y));
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
              let x = bind["start"][0] + j;
              value.push(getGridValue(x, y));
            }
          } else {
            console.error("start end 不合法", bind);
          }
          stdInput[bind["name"]] = value;
        }
      }
    });

    return stdInput;
  }

  getStdOutput(labItems) {
    let experiment = deepCopy(this.experiment);
    let stdInput = this.getStdInput(labItems);
    let stdOutput = execute(experiment["logic"], stdInput);
    return stdOutput;
  }

  calculateLabItems(labItems) {
    let stdOutput = this.getStdOutput(labItems);
    labItems = tableGridsConcat(labItems);

    labItems.forEach((c, i) => {
      let precision = 3;

      function format(value, precision) {
        if (typeof value == "string") {
          return value;
        }
        return math.string(math.round(math.bignumber(value), precision));
      }

      if (c["type"] == "table") {
        for (const bind of this.experiment["ui"][i]["properties"]["binds"]) {
          if (bind["type"] != "variable" || this.dictNameVariable[bind["name"]]["source"]["type"] == "input") {
            continue;
          }

          // output bind

          if (typeof bind["precision"] == "number") {
            precision = bind["precision"];
          }

          let value = stdOutput[bind["name"]];

          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            c["properties"]["grids"][posToIndex(x, y, c["properties"]["width"])]["value"] = format(value, precision);
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
              let y = bind["start"][1] + j;
              // if (typeof value[j] == "undefined") {
              //   console.log(bind);
              //   console.log(value);
              //   console.log(j);
              // }
              c["properties"]["grids"][posToIndex(x, y, c["properties"]["width"])]["value"] = format(
                value[j],
                precision
              );
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
              let x = bind["start"][0] + j;
              // if (typeof value[j] == "undefined") {
              //   console.log(bind);
              //   console.log(value);
              //   console.log(j);
              // }
              c["properties"]["grids"][posToIndex(x, y, c["properties"]["width"])]["value"] = format(
                value[j],
                precision
              );
            }
          } else {
            console.error("start end 不合法", bind);
          }
        }
      } else if (c["type"] == "output") {
        if (typeof c["properties"]["precision"] == "number") {
          precision = c["properties"]["precision"];
          delete c["properties"]["precision"];
        }

        c["properties"]["value"] = format(stdOutput[c["properties"]["variableName"]], precision);
      }
    });

    labItems = tableGridsFlat(labItems);
    return labItems;
  }
}
