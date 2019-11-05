var moment = require("moment");
import { strict } from "assert";

export function ageConvert(date: string) {
  return moment(date, "YYYY-MM-DDTHH:mm:ss").calendar();
}
