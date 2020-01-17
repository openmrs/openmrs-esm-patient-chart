import dayjs from "dayjs";

export function calculateBMI(weight: number, height: number) {
  if (weight > 0 && height > 0) {
    return (weight / (height / 100) ** 2).toFixed(1);
  }
  return null;
}

export function formatDate(strDate: string) {
  const date = dayjs(strDate);
  const today = dayjs(new Date());
  if (
    date.date() === today.date() &&
    date.month() === today.month() &&
    date.year() === today.year()
  ) {
    return `Today ${date.format("hh:mm A")}`;
  } else if (date.year() === today.year()) {
    return date.format("DD-MMM hh:mm A");
  } else {
    return date.format("YYYY DD-MMM");
  }
}
