// TODO UI 限制小数位数
import { execute } from "./executor";
import { p, deepCopy } from "./util";
function isTextBox(type) {
  return type == "input-textbox" || type == "output-textbox";
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

  getLabItems() {
    let experiment = deepCopy(this.experiment);

    const dictNameVariable = getDictNameVariable(experiment["logic"]["variables"]);

    let labItems = [];

    for (const expItem of experiment["ui"]) {
      let labItem = { properties: expItem["properties"], type: expItem["type"] }; // 1个 lab-item 组件 对应的数据

      if (isTextBox(expItem["type"])) {
        let name = expItem["properties"]["variableName"];
        labItem["properties"]["value"] = dictNameVariable[name]["source"]["default"];
      } else if (expItem["type"] === "table") {
        let values = [];
        for (let j = 0; j < expItem["properties"]["width"] * expItem["properties"]["height"]; j++) {
          values.push({ id: j, value: "" });
        }
        for (const bind of expItem["properties"]["binds"]) {
          if (bind["type"] == "variable" && dictNameVariable[bind["name"]]["source"]["type"] != "input") {
            continue;
          }

          let defaultValue;
          if (bind["type"] == "variable") {
            defaultValue = dictNameVariable[bind["name"]]["source"]["default"];
          } else if (bind["type"] == "constant") {
            defaultValue = bind["value"];
          }

          if (bind["start"][0] == bind["end"][0] && bind["start"][1] == bind["end"][1]) {
            let x = bind["start"][0];
            let y = bind["start"][1];
            values[posToIndex(x, y, expItem["properties"]["width"])]["value"] = defaultValue;
          } else if (bind["start"][0] == bind["end"][0]) {
            let x = bind["start"][0];
            for (let j = 0; j < defaultValue.length; j++) {
              let y = bind["start"][1] + j;
              values[posToIndex(x, y, expItem["properties"]["width"])]["value"] = defaultValue[j]; // todo convert to string
            }
          } else if (bind["start"][1] == bind["end"][1]) {
            let y = bind["start"][1];
            for (let j = 0; j < defaultValue.length; j++) {
              let x = bind["start"][0] + j;
              values[posToIndex(x, y, expItem["properties"]["width"])]["value"] = defaultValue[j];
            }
          } else {
            console.error("start end 不合法", bind);
          }
          // delete labItem.properties.binds;
        }
        labItem["properties"]["values"] = values;
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

    for (const c of labItems) {
      p("c", c);
      if (isTextBox(c["type"])) {
        stdInput[c["properties"]["variableName"]] = c["properties"]["value"];
      } else if (c["type"] == "table") {
        for (const bind of c["properties"]["binds"]) {
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
    }
    p("std_input", stdInput);
    return stdInput;
  }

  calculateLabItems(stdInput, labItems) {
    let experiment = deepCopy(this.experiment);

    let result = execute(experiment["logic"], stdInput);
    for (const c of labItems) {
      if (c["type"] == "table") {
        for (const bind of c["properties"]["binds"]) {
          if (bind["type"] != "variable" || this.dictNameVariable[bind["name"]]["source"]["type"] == "input") {
            continue;
          }
          let value = result[bind["name"]];
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
      } else if (c["type"] == "output-textbox") {
        c["properties"]["value"] = result[c["properties"]["variableName"]];
      }
    }
  }
}
