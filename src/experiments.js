/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 22:18:51
 * @Description:
 * @LastEditTime: 2021-10-13 23:56:37
 * @LastEditors: HaoTian Qi
 */
let names = ["刚体转动惯量的测量.json", "霍尔效应实验.json", "平凸透镜曲率半径的测量.json", "音叉振动频率的测量.json"];

let experiments = names.map((value, index) => {
  return require("../res/experiments/" + value);
});

export { experiments };
