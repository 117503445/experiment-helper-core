/*
 * @Author: HaoTian Qi
 * @Date: 2021-10-09 21:49:31
 * @Description:
 * @LastEditTime: 2021-10-15 13:00:16
 * @LastEditors: HaoTian Qi
 */

const fs = require("fs");
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

require("./getLabItems/test");
require("./getStdInput/test");
require("./calculateLabItems/test");
require("./dev/test");
