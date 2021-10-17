function p(...params) {
  params = params.map((v, i) => {
    return JSON.stringify(v, null, 2);
  });
  console.log(...params);
}
function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}
function posToIndex(x, y, width) {
  if (y > width || y < 0) {
    console.error("不合法的 y", y);
  }
  return y - 1 + (x - 1) * width;
}

export { p, deepCopy, posToIndex };
