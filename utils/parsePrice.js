const parsePrice = priceNum => {
  if (typeof priceNum !== 'number') {
    return priceNum;
  }

  const strTruncatedNumber = priceNum.toFixed(2);
  const [$, cents] = strTruncatedNumber.split('.');
  const formatStr = `${$} руб. ${cents} коп.`;

  return formatStr;
};

export default parsePrice;
