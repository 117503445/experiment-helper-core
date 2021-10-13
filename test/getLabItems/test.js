/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-14 00:22:33
 * @Description:
 * @LastEditTime: 2021-10-14 00:48:25
 * @LastEditors: HaoTian Qi
 */

var assert = require("assert");

let Binder = require("../../src/binder").Binder;

let p = require("../../src/util").p;

let experiments = require("../../src/experiments").experiments;

describe("getLabItems", function () {
  let exp = experiments["霍尔效应实验"];
  let binder = new Binder(exp);
  it("Table 有值", function () {
    let items = binder.getLabItems(true);
    assert.equal(JSON.stringify(items), JSON.stringify(require("./out/1.json")));
  });
  it("Table 无值", function () {
    let items = binder.getLabItems(false);
    assert.equal(JSON.stringify(items), JSON.stringify(require("./out/2.json")));
  });
});
