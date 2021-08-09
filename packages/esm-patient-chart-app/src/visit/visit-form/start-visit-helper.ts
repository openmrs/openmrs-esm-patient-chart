import dayjs from 'dayjs';

export const convertTime12to24 = (time12h, timeFormat: string) => {
  let [hours, minutes] = time12h.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (timeFormat === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return [hours, minutes];
};

export const getDatePart = (type: 'year' | 'month' | 'date', date: string | Date) => {
  const visitDate = dayjs(date).format('DD/MM/YYYY');
  switch (type) {
    case 'year':
      return dayjs(visitDate).year();
    case 'month':
      return dayjs(visitDate).month();
    case 'date':
      return dayjs(visitDate).date();
  }
};
