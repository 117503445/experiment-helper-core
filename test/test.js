/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 21:49:31
 * @Description:
 * @LastEditTime: 2021-10-09 22:54:55
 * @LastEditors: HaoTian Qi
 */

var assert = require("assert");

let experiments = require("../src/experiments").experiments;

describe("experiments", function () {
  it("length should == 3", function () {
    assert.equal(experiments.length, 3);
  });
});
