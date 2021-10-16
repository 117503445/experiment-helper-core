var assert = require("assert");
let Binder = require("../../src/binder").Binder;
import { execute } from "../../src/executor";

let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

let dev = require("../../res/experiments/dev.json");

describe("dev", function () {
  it("dev.json", function () {
    let exp = dev;
    let binder = new Binder(exp);

    let labItems = binder.getLabItems(true);
    fs.writeFileSync("./tmp/0-labItems.json", JSON.stringify(labItems, null, 2));

    let stdInput = binder.getStdOutput(labItems);
    fs.writeFileSync("./tmp/stdInput.json", JSON.stringify(stdInput, null, 2));

    binder.calculateLabItems(labItems);

    fs.writeFileSync("./tmp/1-labItems.json", JSON.stringify(labItems, null, 2));
  });
});
