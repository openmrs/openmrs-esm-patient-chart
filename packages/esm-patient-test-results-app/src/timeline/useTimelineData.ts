import { useMemo } from 'react';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { ObsRecord } from '@openmrs/esm-patient-common-lib';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import { ParsedTimeType } from '../filter/filter-types';

export const parseTime: (sortedTimes: Array<string>) => ParsedTimeType = (sortedTimes) => {
  const yearColumns: Array<{ year: string; size: number }> = [],
    dayColumns: Array<{ year: string; day: string; size: number }> = [],
    timeColumns: string[] = [];

  sortedTimes.forEach((datetime) => {
    const parsedDate = parseDate(datetime);
    const year = parsedDate.getFullYear().toString();
    const date = formatDate(parsedDate, { mode: 'wide', year: false });
    const time = formatTime(parsedDate);

    const yearColumn = yearColumns.find(({ year: innerYear }) => year === innerYear);
    if (yearColumn) yearColumn.size++;
    else yearColumns.push({ year, size: 1 });

    const dayColumn = dayColumns.find(({ year: innerYear, day: innerDay }) => date === innerDay && year === innerYear);
    if (dayColumn) dayColumn.size++;
    else dayColumns.push({ day: date, year, size: 1 });

    timeColumns.push(time);
  });

  return { yearColumns, dayColumns, timeColumns, sortedTimes };
};

const parseEntries = (entries: ObsRecord[] = [], type: string) => {
  const rows: Record<string, Array<ObsRecord | undefined>> = {};

  if (type === 'LabSet') {
    entries.forEach((entry, index) => {
      const { members } = entry;
      members.forEach((member) => {
        const { name } = member;
        const row = rows[name] || (rows[name] = []);
        row[index] = member;
      });
    });
  } else if (type === 'Test') {
    entries.forEach((member, index) => {
      const { name } = member;
      const row = rows[name] || (rows[name] = []);
      row[index] = member;
    });
  }

  Object.entries(rows).forEach(([key, value]) => (rows[key] = [...value]));

  return rows;
};

/**
 * Gets all patient sorted obs from usePatientResultsData, filters for panelUuid (if provided),
 * then transforms data to be used by DataTable
 *
 * @param patientUuid - required patient identifier
 * @param panelUuid - optional panel identifier
 * @returns object of {data, loaded, error?} where data is formatted for use by the
 * timeline data table
 *
 */
export const useTimelineData = (patientUuid: string, panelUuid?: string) => {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

  const timelineData = useMemo(() => {
    if (!sortedObs || !loaded || !!error)
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime> },
        loaded,
        error,
      };

    // look for the specified panelUuid. If none is specified, just take any obs
    const [panelName, panelData] = Object.entries(sortedObs).find(([, { uuid }]) => uuid === panelUuid) || [];

    if (!panelData)
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime> },
        loaded,
        error: new Error('panel data missing'),
      };

    const { entries } = panelData;
    const times = entries.map((e) => e.effectiveDateTime);

    const rowData = parseEntries(entries, panelData.type);

    return {
      data: { parsedTime: parseTime(times), rowData, panelName },
      loaded: true,
    };
  }, [sortedObs, loaded, error, panelUuid]);
  return timelineData;
};
