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
  it("default", function () {
    let exp = dev;
    let binder = new Binder(exp);

    let labItems = binder.getLabItems(true);
    fs.writeFileSync("./tmp/debug/default-0-labItems.json", JSON.stringify(labItems, null, 2));

    let stdInput = binder.getStdInput(labItems);
    fs.writeFileSync("./tmp/debug/default-1-stdInput.json", JSON.stringify(stdInput, null, 2));

    let stdOutput = binder.getStdOutput(labItems);
    fs.writeFileSync("./tmp/debug/default-2-stdOutput.json", JSON.stringify(stdOutput, null, 2));

    labItems = binder.calculateLabItems(labItems);
    fs.writeFileSync("./tmp/debug/default-3-calculate.json", JSON.stringify(labItems, null, 2));
  });
  it("clear", function () {
    let exp = dev;
    let binder = new Binder(exp);

    let labItems = binder.getLabItems(false);

    fs.writeFileSync("./tmp/debug/clear-0-labItems.json", JSON.stringify(labItems, null, 2));

    let stdInput = binder.getStdInput(labItems);
    fs.writeFileSync("./tmp/debug/clear-1-stdInput.json", JSON.stringify(stdInput, null, 2));

    // let stdOutput = binder.getStdOutput(labItems);
    // fs.writeFileSync("./tmp/debug/clear-2-stdOutput.json", JSON.stringify(stdOutput, null, 2));

    // binder.calculateLabItems(labItems);
    // fs.writeFileSync("./tmp/debug/clear-3-calculate.json", JSON.stringify(labItems, null, 2));
  });
});
