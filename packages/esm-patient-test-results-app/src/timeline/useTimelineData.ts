import { useMemo } from 'react';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { ObsRecord } from '@openmrs/esm-patient-common-lib';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import { exist } from '../loadPatientTestData/helpers';

const parseTime = (sortedTimes: string[]) => {
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

const parsePanel = (panelData) => {
  const sample = panelData?.entries?.[0];
  const outData = {
    uuid: panelData.uuid,
    type: panelData.type,
    name: sample.name,
    meta: {
      ...sample.meta,
      range: exist(sample?.meta?.lowNormal, sample?.meta?.hiNormal)
        ? `${sample.meta.lowNormal} – ${sample.meta.hiNormal}`
        : null,
    },
    entries: [],
  };
  let transformedEntries = [];
  panelData.entries.forEach((entry) => {
    transformedEntries.push({
      value: entry.value,
      effectiveDateTime: entry.effectiveDateTime,
      interpretation:
        entry.meta.assessValue && typeof entry.meta.assessValue === 'function'
          ? entry.meta.assessValue(entry.value)
          : '--',
    });
  });
  outData.entries = transformedEntries || [];
  return outData;
};

/**
 * Gets all patient sorted obs from usePatientResultsData, filters for panelUuids (if provided),
 * then transforms data to be used by DataTable
 *
 * @param patientUuid - required patient identifier
 * @param panelUuids - optional panel identifier
 * @returns object of {data, loaded, error?} where data is formatted for use by the
 * timeline data table
 *
 */
export const useManyTimelineData = (patientUuid: string, panelUuids?: string[]) => {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

  const timelineData = useMemo(() => {
    if (!sortedObs || !loaded || !!error)
      return {
        data: { parsedTime: {} as ReturnType<typeof parseTime>, rowData: {}, panelName: '' },
        loaded,
        error,
      };
    // look for the specified panelUuid. If none is specified, just take any obs
    const panels = Object.entries(sortedObs).filter(([, { uuid }]) => panelUuids.includes(uuid)) || [];

    let rows = {};

    panels?.forEach((panel) => {
      const [panelName, panelData] = panel;
      if (panelData) {
        rows[panelName] = parsePanel(panelData);
      }
    });

    const allTimes = [
      ...new Set(
        Object.keys(rows)
          .map((row) => rows[row].entries.map((e) => e.effectiveDateTime))
          .flat(),
      ),
    ];
    allTimes.sort((a, b) => (new Date(a) < new Date(b) ? 1 : -1));
    Object.keys(rows).forEach((row) => {
      const newEntries = allTimes.map((time) => rows[row].entries.find((entry) => entry.effectiveDateTime === time));
      rows[row].entries = newEntries;
    });
    const panelName = 'Timeline';
    return {
      data: { parsedTime: parseTime(allTimes), rowData: rows, panelName },
      loaded: true,
    };
  }, [sortedObs, loaded, error, panelUuids]);
  return timelineData;
};

/**
 * Very bad way to get panelUuid that for all tests that pertain to a patient
 * Hopefully there's a better endpoint for this
 *
 * @param patientUuid - required patient identifier
 * @returns Object of {data, loaded, error} where data is an object in format
 * "PanelName": panelUuid
 *
 */
export const usePatientPanels = (patientUuid: string) => {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

  const panels = useMemo(() => {
    if (!sortedObs || !loaded || !!error)
      return {
        data: [{ parsedTime: {} as ReturnType<typeof parseTime> }],
        loaded,
        error,
      };

    const outData = {};
    Object.entries(sortedObs).forEach(([key, value]) => (outData[key] = value.uuid));
    return { loaded: true, data: outData };
  }, [sortedObs, loaded, error]);

  return panels;
};
