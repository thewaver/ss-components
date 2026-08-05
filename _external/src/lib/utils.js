export const splitCamelCase = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

export const getRandomValue = (obj) => {
  const keys = Object.keys(obj);
  const randomKey = Math.floor(Math.random() * keys.length);

  return obj[keys[randomKey]];
}
