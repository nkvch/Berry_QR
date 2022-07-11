const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return date;
};

export default getStartOfToday;
