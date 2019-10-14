// Based on http://www.gregoryschmidt.ca/writing/patient-age-display-ehr-conventions,
// which is different from npm packages such as https://www.npmjs.com/package/timeago
export function age(dateString: string): string {
  const today = new Date();
  const birthDate = new Date(dateString);
  const monthDifference = today.getUTCMonth() - birthDate.getUTCMonth();
  const dateDifference = today.getUTCDate() - birthDate.getUTCDate();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  if (monthDifference < 0 || (monthDifference === 0 && dateDifference < 0)) {
    age--;
  }

  let monthsAgo = monthDifference >= 0 ? monthDifference : monthDifference + 12;
  if (dateDifference < 0) {
    monthsAgo--;
  }
  const monthsAgoStr = monthsAgo > 0 ? `${monthsAgo}mo` : "";
  let totalDaysAgo = daysIntoYear(today) - daysIntoYear(birthDate);
  if (totalDaysAgo < 0) {
    totalDaysAgo += 365;
  }
  const weeksAgo = Math.floor(totalDaysAgo / 7);
  const daysAgoWithinWeek = totalDaysAgo - weeksAgo * 7;

  if (age === 0) {
    if (isSameDay(today, birthDate)) {
      return `Today`;
    } else if (weeksAgo < 4) {
      return `${totalDaysAgo}d`;
    } else {
      return `${weeksAgo}w ${
        daysAgoWithinWeek > 0 ? `${daysAgoWithinWeek}d` : ""
      }`.trim();
    }
  } else if (age < 2) {
    return `${monthsAgoStr} ${age}yr`.trim();
  } else if (age < 18) {
    return `${age}yr ${monthsAgoStr}`.trim();
  } else {
    return `${age}yr`;
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
