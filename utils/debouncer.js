class Debouncer {
  constructor(timeoutValue) {
    this.timeoutValue = timeoutValue;
    this.timeout = null;
  };

  debounce = callback => {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(callback, this.timeoutValue);
  };
};

export default Debouncer;
