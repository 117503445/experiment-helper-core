function p(...params) {
  params = params.map((v, i) => {
    return JSON.stringify(v, null, 2);
  });
  console.log(...params);
}
function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}
export { p, deepCopy };
