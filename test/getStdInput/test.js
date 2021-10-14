/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-14 10:02:23
 * @Description:
 * @LastEditTime: 2021-10-14 10:36:09
 * @LastEditors: HaoTian Qi
 */

var assert = require("assert");
let Binder = require("../../src/binder").Binder;
let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

describe("getStdInput", function () {
  let exp = experiments["霍尔效应实验"];
  let binder = new Binder(exp);
  it("1.json", function () {
    let items = binder.getLabItems(true);
    let stdInput = binder.getStdInput(items);
    fs.writeFileSync("./tmp/1.json", JSON.stringify(stdInput, null, 2));
    // assert.equal(JSON.stringify(stdInput), JSON.stringify(require("./out/1.json")));
  });
});
