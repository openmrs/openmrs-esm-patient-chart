import dayjs from "dayjs";

export function formatNotesDate(date: string): string {
  const unprocessedDate = dayjs(date);
  if (unprocessedDate.format("DD-MMM-YYYY") === dayjs().format("DD-MMM-YYYY")) {
    return "Today   ".concat(unprocessedDate.format("hh:mm A"));
  } else if (unprocessedDate.format("YYYY") === dayjs().format("YYYY")) {
    return unprocessedDate.format("DD-MMM hh:mm A");
  }
  return unprocessedDate.format("DD-MMM-YYYY hh:mm A");
}
