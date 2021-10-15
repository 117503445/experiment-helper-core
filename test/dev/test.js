var assert = require("assert");
let Binder = require("../../src/binder").Binder;
import { execute } from "../../src/executor";

let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

describe("dev", function () {
  it("单线扭摆实验", function () {
    let exp = experiments["单线扭摆实验"];
    let binder = new Binder(exp);

    let labItems = binder.getLabItems();

    let stdInput = binder.getStdInput(labItems);
    let result = execute(binder.experiment["logic"], stdInput);
    fs.writeFileSync("./tmp/result.json", JSON.stringify(result, null, 2));

    binder.calculateLabItems(labItems);

    fs.writeFileSync("./tmp/labItems.json", JSON.stringify(labItems, null, 2));
  });
});
