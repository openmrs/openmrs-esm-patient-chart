// Based on http://www.gregoryschmidt.ca/writing/patient-age-display-ehr-conventions,
// which is different from npm packages such as https://www.npmjs.com/package/timeago
export function age(dateString: string): string {
  // First calculate the age in years
  const today = new Date();
  const birthDate = new Date(dateString);
  const monthDifference = today.getUTCMonth() - birthDate.getUTCMonth();
  const dateDifference = today.getUTCDate() - birthDate.getUTCDate();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  if (monthDifference < 0 || (monthDifference === 0 && dateDifference < 0)) {
    age--;
  }

  // Now calculate the number of months in addition to the year's age
  let monthsAgo = monthDifference >= 0 ? monthDifference : monthDifference + 12;
  if (dateDifference < 0) {
    monthsAgo--;
  }
  const monthsAgoStr = monthsAgo > 0 ? `${monthsAgo} mo` : "";

  // For patients less than a year old, we calculate the number of days/weeks they have been alive
  let totalDaysAgo = daysIntoYear(today) - daysIntoYear(birthDate);
  if (totalDaysAgo < 0) {
    totalDaysAgo += 365;
  }
  const weeksAgo = Math.floor(totalDaysAgo / 7);

  // The "remainder" number of days after the weeksAgo number of weeks
  const remainderDaysInWeek = totalDaysAgo - weeksAgo * 7;

  // Depending on their age, return a different representation of their age.
  if (age === 0) {
    if (isSameDay(today, birthDate)) {
      return `Today`;
    } else if (weeksAgo < 4) {
      return `${totalDaysAgo}d`;
    } else {
      return `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ${
        remainderDaysInWeek > 0 ? `${remainderDaysInWeek} d` : ""
      }`.trim();
    }
  } else if (age < 2) {
    return `${monthsAgoStr} ${age} yr`.trim();
  } else if (age < 18) {
    return `${age} yr ${monthsAgoStr}`.trim();
  } else {
    return `${age} yr`;
  }
}

function daysIntoYear(date) {
  return (
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  );
}

function isSameDay(firstDate: Date, secondDate: Date) {
  const firstISO = firstDate.toISOString();
  const secondISO = secondDate.toISOString();
  return (
    firstISO.slice(0, firstISO.indexOf("T")) ===
    secondISO.slice(0, secondISO.indexOf("T"))
  );
}
