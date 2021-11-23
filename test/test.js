/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 21:49:31
 * @Description:
 * @LastEditTime: 2021-11-23 16:26:26
 * @LastEditors: HaoTian Qi
 */

const fs = require("fs");

let dirTmp = "./tmp";

if (fs.existsSync(dirTmp)) {
  fs.rmSync(dirTmp, { recursive: true });
}
fs.mkdirSync(dirTmp);

require("./util/test")

// require("./debug/test");

// require("./dev/test");

require("./exp/test");
