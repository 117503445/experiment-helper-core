/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-14 00:22:33
 * @Description:
 * @LastEditTime: 2021-10-14 11:21:21
 * @LastEditors: HaoTian Qi
 */

var assert = require("assert");
let Binder = require("../../src/binder").Binder;
let p = require("../../src/util").p;
let experiments = require("../../src/experiments").experiments;
const fs = require("fs");
// fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));

describe("getLabItems", function () {
  let exp = experiments["霍尔效应实验"];
  let binder = new Binder(exp);
  it("Table 有值", function () {
    let items = binder.getLabItems(true);
    // fs.writeFileSync("./tmp/1.json", JSON.stringify(items, null, 2));
    assert.equal(JSON.stringify(items), JSON.stringify(require("./out/1.json")));
  });
  it("Table 无值", function () {
    let items = binder.getLabItems(false);
    // fs.writeFileSync("./tmp/2.json", JSON.stringify(items, null, 2));
    assert.equal(JSON.stringify(items), JSON.stringify(require("./out/2.json")));
  });
});
