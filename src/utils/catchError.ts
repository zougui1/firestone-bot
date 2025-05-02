export const catchError = <T>(func: () => T): [undefined, T] | [unknown, undefined] => {
  try {
    const result = func();
    return [undefined, result];
  } catch (error) {
    return [error, undefined];
  }
}
