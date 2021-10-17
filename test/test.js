/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 21:49:31
 * @Description:
 * @LastEditTime: 2021-10-17 18:39:49
 * @LastEditors: HaoTian Qi
 */

const fs = require("fs");

let dirTmp = "./tmp";

if (fs.existsSync(dirTmp)) {
  fs.rmdirSync(dirTmp, { recursive: true });
}
fs.mkdirSync(dirTmp);

// require("./getLabItems/test");
// require("./getStdInput/test");
// require("./calculateLabItems/test");

require("./debug/test");
// require("./dev/test");

require("./exp/test");
