const parsePrice = priceNum => {
  if (typeof priceNum !== 'number') {
    return priceNum;
  }

  const strTruncatedNumber = priceNum.toFixed(2);
  const [$, cents] = strTruncatedNumber.split('.');
  const formatStr = `${$} zł. ${cents} gr.`;

  return formatStr;
};

export default parsePrice;
