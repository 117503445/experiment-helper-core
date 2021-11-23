/*
 * @Author: HaoTian Qi
 * @Date: 2021-11-23 16:05:29
 * @Description:
 * @LastEditTime: 2021-11-23 16:27:01
 * @LastEditors: HaoTian Qi
 */
var assert = require("assert");
var util = require("../../src/util");
let p = require("../../src/util").p;

describe("util", function () {
  it("FixTailZero", () => {
    assert.equal(util.FixTailZero("1", 2), "1.00");
    assert.equal(util.FixTailZero("1.0", 2), "1.00");
    assert.equal(util.FixTailZero("1", 0), "1");
    assert.equal(util.FixTailZero("1.0", 0), "1");
  });
});
