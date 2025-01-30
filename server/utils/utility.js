export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const sortByKey = (arr, key, order = "desc") => {
  return arr.sort((a, b) => {
    if (typeof a[key] === "string") {
      return order === "desc"
        ? b[key].localeCompare(a[key])
        : a[key].localeCompare(b[key]);
    }
    return order === "desc" ? b[key] - a[key] : a[key] - b[key];
  });
};
