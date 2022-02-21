import * as React from 'react';
import RangeSelector from './range-selector.component';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { Button } from 'carbon-components-react';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import LineChart from '@carbon/charts-react/line-chart';
import { ScaleTypes, LineChartOptions, TickRotations } from '@carbon/charts/interfaces';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import { ObsRecord, OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import CommonDataTable from '../overview/common-datatable.component';
import { exist } from '../loadPatientTestData/helpers';
import { useTranslation } from 'react-i18next';
import styles from './trendline.scss';
import '@carbon/charts/styles.css';

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

  const panel = Object.entries(sortedObs).find(([, { uuid }]) => uuid === panelUuid);

  switch (panel[1].type) {
    case 'LabSet':
      const data = panel[1].entries
        .flatMap((x) => x.members.filter((y) => y.conceptClass === testUuid))
        .sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime));
      return [data[0].name, data, panel[0]];
    case 'Test':
      return [
        panel[0],
        panel[1].entries.sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime)),
        undefined,
      ];
  }
};

const TrendLineBackground = ({ ...props }) => <div {...props} className={styles['Background']} />;

const withPatientData =
  (WrappedComponent) =>
  ({ patientUuid, panelUuid, testUuid, openTimeline: openTimelineExternal }) => {
    const patientData = useTrendlineData({ patientUuid, panelUuid, testUuid });
    const openTimeline = React.useCallback(() => openTimelineExternal(panelUuid), [panelUuid, openTimelineExternal]);

    if (!patientData) return <div>Loading...</div>;

    return <WrappedComponent patientData={patientData} openTimeline={openTimeline} />;
  };

const TrendlineHeader = ({ openTimeline, title, referenceRange }) => {
  const { t } = useTranslation();
  return (
    <div className={styles['header']}>
      <div className={styles['back-button']}>
        <Button kind="ghost" renderIcon={ArrowLeft24} iconDescription="Return to timeline" onClick={openTimeline}>
          <span>{t('backToTimeline', 'Back to timeline')}</span>
        </Button>
      </div>
      <div className={styles['content']}>
        <span className={styles['title']}>{title}</span>
        <span className={styles['reference-range']}>{referenceRange}</span>
      </div>
    </div>
  );
};

const Trendline: React.FC<{
  patientData: ReturnType<typeof useTrendlineData>;
  openTimeline: () => void;
}> = ({ patientData, openTimeline }) => {
  const { t } = useTranslation();

  const leftAxisLabel = patientData?.[1]?.[0]?.meta?.units ?? '';
  const [range, setRange] = React.useState<[Date, Date]>();

  const [upperRange, lowerRange] = React.useMemo(() => {
    const dates = patientData[1].map((entry) => new Date(Date.parse(entry.effectiveDateTime)));
    return [new Date(), dates[dates.length - 1]];
  }, [patientData]);

  const setLowerRange = React.useCallback(
    (selectedLowerRange: Date) => {
      setRange([selectedLowerRange > lowerRange ? selectedLowerRange : lowerRange, upperRange]);
    },
    [setRange, upperRange, lowerRange],
  );

  /**
   * reorder svg element to bring line in front of the area
   */
  React.useLayoutEffect(() => {
    const graph = document.querySelector('g.bx--cc--area')?.parentElement;
    if (patientData && graph) {
      graph.insertBefore(graph.children[3], graph.childNodes[2]);
    }
  }, [patientData]);

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
    interpretation?: OBSERVATION_INTERPRETATION;
  }> = [];

  const dataset = patientData[0];
  const referenceRange = patientData[1][0]?.meta?.range;

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
      date: formatDate(parseDate(entry.effectiveDateTime)),
      time: formatTime(parseDate(entry.effectiveDateTime)),
      value: entry.value,
      id: entry.id,
      interpretation: entry.meta.assessValue?.(entry.value),
    });
  });

  const options = React.useMemo<LineChartOptions>(
    () => ({
      bounds: {
        lowerBoundMapsTo: 'min',
        upperBoundMapsTo: 'max',
      },
      axes: {
        bottom: {
          title: 'Date',
          mapsTo: 'date',
          scaleType: ScaleTypes.TIME,
          ticks: {
            rotation: TickRotations.ALWAYS,
            // formatter: x => x.toLocaleDateString("en-US", TableDateFormatOption)
          },
          domain: range,
        },
        left: {
          mapsTo: 'value',
          title: leftAxisLabel,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      height: '20.125rem',

      color: {
        scale: {
          [dataset]: '#6929c4',
        },
      },
      points: {
        radius: 4,
        enabled: true,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        customHTML: ([{ date, value }]) =>
          `<div class="bx--tooltip bx--tooltip--shown" style="min-width: max-content; font-weight:600">${value} ${leftAxisLabel}<br>
          <span style="color: #c6c6c6; font-size: 0.75rem; font-weight:400">${formatDate(date)}</span></div>`,
      },
    }),
    [leftAxisLabel, range, dataset],
  );

  const tableHeaderData = React.useMemo(
    () => [
      {
        header: t('date', 'Date'),
        key: 'date',
      },
      {
        header: t('value', 'Value') + ` (${leftAxisLabel})`,
        key: 'value',
      },
      {
        header: t('timeOfTest', 'Time of Test'),
        key: 'time',
      },
    ],
    [leftAxisLabel, t],
  );

  return (
    <>
      <TrendlineHeader openTimeline={openTimeline} title={dataset} referenceRange={referenceRange} />
      <TrendLineBackground>
        <RangeSelector setLowerRange={setLowerRange} upperRange={upperRange} />
        <LineChart data={data} options={options} />
      </TrendLineBackground>

      <DrawTable {...{ tableData, tableHeaderData }} />
    </>
  );
};

const DrawTable = React.memo<{ tableData; tableHeaderData }>(({ tableData, tableHeaderData }) => {
  return <CommonDataTable data={tableData} tableHeaders={tableHeaderData} />;
});

export default React.memo(withPatientData(Trendline));
