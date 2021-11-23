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

function IndexToPos(index, width) {
  let y = (index % width) + 1;
  let x = (index - y + 1) / width + 1;
  return { x, y };
}

function FixTailZero(num, precision) {
  num = num.toString();

  precision = parseInt(precision, 10)

  let splits = num.split(".");

  let integer = splits[0];
  let decimal = "";

  if (splits.length == 2) {
    decimal = splits[1];
  } else if (splits.length > 2) {
    throw "num illegal";
  }
  decimal = decimal.padEnd(precision, "0");

  if (precision == 0) {
    return integer;
  } else {
    return `${integer}.${decimal}`;
  }
}

export { p, deepCopy, posToIndex, IndexToPos, FixTailZero };
