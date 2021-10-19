var assert = require("assert");
let Binder = require("../../src/binder").Binder;
import { execute } from "../../src/executor";

let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
const check = require("../../src/check").check;
const Result = require("../../src/check").Result;
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

describe("exp", function () {
  for (let name in experiments) {
    let path = "./tmp/" + name + "/";
    fs.mkdirSync(path);
    describe(name, () => {
      let exp = experiments[name];
      it("check", () => {
        let result = check(exp);

        // if (!result.isEmpty) {
        //   p("result", result);
        // }
        assert.equal(result.isEmpty, true, JSON.stringify(result, null, 2));
      });
      it("run", () => {
        let binder = new Binder(exp);

        let labItems = binder.getLabItems(true);
        fs.writeFileSync(path + "0-labItems.json", JSON.stringify(labItems, null, 2));

        let stdInput = binder.getStdInput(labItems);
        fs.writeFileSync(path + "1-stdInput.json", JSON.stringify(stdInput, null, 2));

        let stdOutput = binder.getStdOutput(labItems);
        fs.writeFileSync(path + "2-stdOutput.json", JSON.stringify(stdOutput, null, 2));

        labItems = binder.calculateLabItems(labItems);
        fs.writeFileSync(path + "3-calculate.json", JSON.stringify(labItems, null, 2));
      });
    });
  }
});
