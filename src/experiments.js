/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 22:18:51
 * @Description:
 * @LastEditTime: 2021-10-14 00:14:18
 * @LastEditors: HaoTian Qi
 */
let names = ["刚体转动惯量的测量", "霍尔效应实验", "平凸透镜曲率半径的测量", "音叉振动频率的测量"];

let experiments = {};
for (const value of names) {
  experiments[value] = require("../res/experiments/" + value + ".json");
}

export { experiments };
