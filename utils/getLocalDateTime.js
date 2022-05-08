const getLocalDateTime = () => {
  const dateTime = new Date();
  const offset = dateTime.getTimezoneOffset() * 60 * 1000;
  const localDateTime = new Date(dateTime - offset);

  return localDateTime;
};

export default getLocalDateTime;
