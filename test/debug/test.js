var assert = require("assert");
let Binder = require("../../src/binder").Binder;
import { execute } from "../../src/executor";

let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

let dev = require("../../res/experiments/debug.json");
fs.mkdirSync("./tmp/debug");
describe("debug", function () {
  it("debug.json", function () {
    let exp = dev;
    let binder = new Binder(exp);

    let labItems = binder.getLabItems(true);
    fs.writeFileSync("./tmp/debug/0-labItems.json", JSON.stringify(labItems, null, 2));

    let stdInput = binder.getStdInput(labItems);
    fs.writeFileSync("./tmp/debug/stdInput.json", JSON.stringify(stdInput, null, 2));

    let stdOutput = binder.getStdOutput(labItems);
    fs.writeFileSync("./tmp/debug/stdOutput.json", JSON.stringify(stdOutput, null, 2));

    binder.calculateLabItems(labItems);
    fs.writeFileSync("./tmp/debug/1-labItems.json", JSON.stringify(labItems, null, 2));
  });
});
