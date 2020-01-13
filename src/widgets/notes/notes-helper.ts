import dayjs from "dayjs";

export function getAuthorName(note: any): string {
  let author: any;
  if (note.participant) {
    author = note.participant[0].individual.display;
    return author.toUpperCase();
  } else if (note.extension) {
    author = note.extension.find(ext => ext.url === "changedBy");
    return author ? author.valueString.toUpperCase() : "";
  }
}
export function getNotes(notes) {
  return notes.map(note => note.resource);
}
export function formatNotesDate(date: string): string {
  const unprocessedDate = dayjs(date);
  if (unprocessedDate.format("DD-MMM-YYYY") === dayjs().format("DD-MMM-YYYY")) {
    return "Today   ".concat(unprocessedDate.format("hh:mm A"));
  } else if (unprocessedDate.format("YYYY") === dayjs().format("YYYY")) {
    return unprocessedDate.format("DD-MMM hh:mm A");
  }
  return unprocessedDate.format("DD-MMM-YYYY hh:mm A");
}
