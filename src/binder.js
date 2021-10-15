// TODO UI 限制小数位数
import { execute } from "./executor";
import { p, deepCopy } from "./util";
function isTextBox(type) {
  return type == "input" || type == "output";
}

function posToIndex(x, y, width) {
  if (y > width || y < 0) {
    console.error("不合法的 y", y);
  }
  return y - 1 + (x - 1) * width;
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
   * @param {boolean} tableInputHasValue table 组件中 变量输入格 是否有值。初始化时，传入 true。实现一键清空时，传入 false。
   * @return {Object} 返回 labItems
   */
  getLabItems(tableInputHasValue = true) {
    let experiment = deepCopy(this.experiment);

    const dictNameVariable = getDictNameVariable(experiment["logic"]["variables"]);

    let labItems = [];

    for (const expItem of experiment["ui"]) {
      let labItem = { properties: expItem["properties"], type: expItem["type"] }; // 1个 lab-item 组件 对应的数据

      switch (expItem["type"]) {
        case "input":
          let name = expItem["properties"]["variableName"];
          labItem["properties"]["default"] = dictNameVariable[name]["source"]["default"];
          labItem["properties"]["value"] = "";
          labItem["properties"]["readonly"] = false;
          break;
        case "output":
          labItem["properties"]["default"] = "#";
          labItem["properties"]["value"] = "";
          labItem["properties"]["readonly"] = true;
          break;
        case "textbox":
          break;
        case "table":
          let grids = [];
          for (let j = 0; j < expItem["properties"]["width"] * expItem["properties"]["height"]; j++) {
            grids.push({ id: j, type: "undefined" });
            // 单元格 type : input output constant undefined
          }
          for (const bind of expItem["properties"]["binds"]) {
            // if (bind["type"] == "variable" && dictNameVariable[bind["name"]]["source"]["type"] != "input") {
            //   continue;
            // }

            // if (bind["type"] == "variable" && !tableInputHasValue) { // todo
            //   continue;
            // }

            console.log("bind", bind);

            let readonly;
            let type;

            let defaultValue;
            switch (bind["type"]) {
              case "variable":
                if (dictNameVariable[bind["name"]]["source"]["type"] == "input") {
                  type = "input";
                  defaultValue = dictNameVariable[bind["name"]]["source"]["default"];
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
            console.log("bind type", type);

            if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
              let x = bind["start"][0];
              let y = bind["start"][1];

              let g = grids[posToIndex(x, y, expItem["properties"]["width"])];

              g["type"] = type;

              switch (type) {
                case "input":
                  g["default"] = defaultValue;
                  g["value"] = "";
                  break;
                case "output":
                  g["value"] = "#";
                  break;
                case "constant":
                  g["value"] = defaultValue;
                  break;
              }
            } else if (bind["start"][0] == bind["end"][0]) {
              let x = bind["start"][0];
              for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
                let y = bind["start"][1] + j;
                let g = grids[posToIndex(x, y, expItem["properties"]["width"])];

                g["readonly"] = readonly;
                g["type"] = type;

                switch (type) {
                  case "input":
                    g["default"] = defaultValue[j];
                    g["value"] = "";
                    break;
                  case "output":
                    g["value"] = "#";
                    break;
                  case "constant":
                    g["value"] = defaultValue[j];
                    break;
                }
              }
            } else if (bind["start"][1] == bind["end"][1]) {
              let y = bind["start"][1];
              for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
                let x = bind["start"][0] + j;
                let g = grids[posToIndex(x, y, expItem["properties"]["width"])];

                g["readonly"] = readonly;
                g["type"] = type;

                switch (type) {
                  case "input":
                    g["default"] = defaultValue[j];
                    g["value"] = "";
                    break;
                  case "output":
                    g["value"] = "#";
                    break;
                  case "constant":
                    g["value"] = defaultValue[j];
                    break;
                }
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
    return labItems;
  }

  getStdInput(labItems) {
    let stdInput = {};

    labItems.forEach((c, i) => {
      if (isTextBox(c["type"])) {
        stdInput[c["properties"]["variableName"]] = c["properties"]["value"];
      } else if (c["type"] == "table") {
        for (const bind of this.experiment["ui"][i]["properties"]["binds"]) {
          if (bind["type"] != "variable" || this.dictNameVariable[bind["name"]]["source"]["type"] != "input") {
            continue;
          }
          let value = [];

          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            value = c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"];
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
              let y = bind["start"][1] + j;
              value.push(c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"]);
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
              let x = bind["start"][0] + j;
              value.push(c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"]);
            }
          } else {
            console.error("start end 不合法", bind);
          }
          stdInput[bind["name"]] = value;
        }
      }
    });

    // p("std_input", stdInput);
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

    labItems.forEach((c, i) => {
      if (c["type"] == "table") {
        for (const bind of this.experiment["ui"][i]["properties"]["binds"]) {
          if (bind["type"] != "variable" || this.dictNameVariable[bind["name"]]["source"]["type"] == "input") {
            continue;
          }
          let value = stdOutput[bind["name"]];
          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"] = value;
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < bind["end"][1] - bind["start"][1] + 1; j++) {
              let y = bind["start"][1] + j;
              c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"] = value[j];
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < bind["end"][0] - bind["start"][0] + 1; j++) {
              let x = bind["start"][0] + j;

              c["properties"]["values"][posToIndex(x, y, c["properties"]["width"])]["value"] = value[j];
            }
          } else {
            console.error("start end 不合法", bind);
          }
        }
      } else if (c["type"] == "output") {
        c["properties"]["value"] = stdOutput[c["properties"]["variableName"]];
      }
    });
  }
}
