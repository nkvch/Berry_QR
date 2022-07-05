const applyCallbackIfExists = (func, callback) => callback ? (...funcArgs) => {
  func(...funcArgs);
  callback(...funcArgs);
} : func;

export default applyCallbackIfExists;
