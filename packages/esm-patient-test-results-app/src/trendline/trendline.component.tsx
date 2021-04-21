import * as React from "react";
import AreaChart from "@carbon/charts-react/area-chart";
// ScaleTypes
import {
  default as DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "carbon-components-react/es/components/DataTable";
import {
  ScaleTypes,
  AreaChartOptions,
  TickRotations,
} from "@carbon/charts/interfaces";
import ArrowLeft24 from "@carbon/icons-react/es/arrow--left/24";
import "@carbon/charts/styles.css";

import usePatientResultsData from "../loadPatientTestData/usePatientResultsData";
import styles from "./trendline.scss";
import { ObsRecord } from "../loadPatientTestData/types";
import { exist } from "../loadPatientTestData/helpers";
import {
  toOmrsDayDateFormat,
  toOmrsTimeString24,
  toOmrsYearlessDateFormat,
} from "@openmrs/esm-framework";
import { LineChart } from "@carbon/charts-react";

const useTrendlineData = ({
  patientUuid,
  panelUuid,
  testUuid,
}: {
  patientUuid: string;
  panelUuid: string;
  testUuid: string;
}): [string, Array<ObsRecord>, string | undefined] | null => {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

  if (!loaded || error) {
    return null;
  }

  const panel = Object.entries(sortedObs).find(
    ([, { uuid }]) => uuid === panelUuid
  );

  switch (panel[1].type) {
    case "LabSet":
      const data = panel[1].entries
        .flatMap((x) => x.members.filter((y) => y.conceptClass === testUuid))
        .sort(
          (ent1, ent2) =>
            Date.parse(ent2.effectiveDateTime) -
            Date.parse(ent1.effectiveDateTime)
        );
      return [data[0].name, data, panel[0]];
    case "Test":
      return [
        panel[0],
        panel[1].entries.sort(
          (ent1, ent2) =>
            Date.parse(ent2.effectiveDateTime) -
            Date.parse(ent1.effectiveDateTime)
        ),
        undefined,
      ];
  }
};

type TrendlineParams = {
  patientUuid: string;
  panelUuid: string;
  testUuid: string;
};

const TrendLineBackground = ({ ...props }) => (
  <div {...props} className={styles["Background"]} />
);

const withPatientData = (WrappedComponent) => ({
  patientUuid,
  panelUuid,
  testUuid,
  openTimeline: openTimelineExternal,
}) => {
  const patientData = useTrendlineData({ patientUuid, panelUuid, testUuid });
  const openTimeline = React.useCallback(
    () => openTimelineExternal(panelUuid),
    [panelUuid]
  );

  if (!patientData) return <div>Loading...</div>;

  return (
    <WrappedComponent patientData={patientData} openTimeline={openTimeline} />
  );
};

const DateFormatOption: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};
const TableDateFormatOption: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};
const TableTimeFormatOption: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const TrendlineHeader = ({ openTimeline, title }) => (
  <div className={styles["header"]}>
    <div
      onClick={openTimeline}
      role="button"
      className={styles["back-button"]}
      tabIndex={0}
    >
      <ArrowLeft24></ArrowLeft24> Back to timeline
    </div>
    <div className={styles["title"]}>{title}</div>
  </div>
);

const Trendline: React.FC<{
  patientData: ReturnType<typeof useTrendlineData>;
  openTimeline: () => void;
}> = ({ patientData, openTimeline }) => {
  const leftAxisLabel = patientData?.[1]?.[0]?.meta?.units ?? "";

  const data: Array<{
    date: Date;
    value: number;
    group: string;
    id: string;
    min?: number;
    max?: number;
  }> = [];
  const tableData: Array<{
    date: string;
    time: string;
    value: number;
    id: string;
  }> = [];

  let dataset = patientData[0];

  patientData[1].forEach((entry) => {
    const range =
      exist(entry?.meta?.hiNormal) && exist(entry?.meta?.lowNormal)
        ? {
            max: entry.meta.hiNormal,
            min: entry.meta.lowNormal,
          }
        : {};

    data.push({
      date: new Date(Date.parse(entry.effectiveDateTime)),
      value: entry.value,
      group: dataset,
      id: entry.id,
      ...range,
    });

    tableData.push({
      date: toOmrsYearlessDateFormat(entry.effectiveDateTime),
      time: toOmrsTimeString24(entry.effectiveDateTime),
      value: entry.value,
      id: entry.id,
    });
  });

  const options = React.useMemo<AreaChartOptions>(
    () => ({
      bounds: {
        lowerBoundMapsTo: "min",
        upperBoundMapsTo: "max",
      },
      // "title": dataset,
      axes: {
        bottom: {
          title: "Date",
          mapsTo: "date",
          scaleType: ScaleTypes.TIME,
          ticks: {
            rotation: TickRotations.ALWAYS,
            // formatter: x => x.toLocaleDateString("en-US", TableDateFormatOption)
          },
        },
        left: {
          mapsTo: "value",
          title: leftAxisLabel,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      height: "20.125rem",

      color: {
        scale: {
          dataset: "#6929c4",
        },
      },
      legend: {
        enabled: false,
      },
    }),
    [leftAxisLabel]
  );

  const tableHeaderData = React.useMemo(
    () => [
      {
        header: "Date",
        key: "date",
      },
      {
        header: "Time",
        key: "time",
      },
      {
        header: `Value (${leftAxisLabel})`,
        key: "value",
      },
    ],
    [leftAxisLabel]
  );

  return (
    <>
      <TrendlineHeader openTimeline={openTimeline} title={dataset} />
      <TrendLineBackground>
        <LineChart data={data} options={options} />
      </TrendLineBackground>

      <DrawTable {...{ tableData, tableHeaderData }} />
    </>
  );
};

const DrawTable = React.memo<{ tableData; tableHeaderData }>(
  ({ tableData, tableHeaderData }) => {
    return (
      <DataTable rows={tableData} headers={tableHeaderData}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer title="DataTable">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    );
  }
);

export default React.memo(withPatientData(Trendline));
