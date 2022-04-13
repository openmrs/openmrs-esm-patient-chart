import React, { useContext } from 'react';
import RangeSelector from './range-selector.component';
import { Button } from 'carbon-components-react';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import LineChart from '@carbon/charts-react/line-chart';
import { ScaleTypes, LineChartOptions, TickRotations } from '@carbon/charts/interfaces';
import { formatDate, formatTime, parseDate, ConfigurableLink } from '@openmrs/esm-framework';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import CommonDataTable from '../overview/common-datatable.component';
import { useTranslation } from 'react-i18next';
import styles from './trendline.scss';
import '@carbon/charts/styles.css';
import { FilterContext } from '../filter/filter-context';
import { testResultsBasePath } from '../helpers';

// const useTrendlineData = ({
//   patientUuid,
//   panelUuid,
//   testUuid,
// }: {
//   patientUuid: string;
//   panelUuid: string;
//   testUuid: string;
// }): [string, Array<ObsRecord>, string | undefined] | null => {
//   const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);

//   if (!loaded || error) {
//     return null;
//   }

//   const panel = Object.entries(sortedObs).find(([, { uuid }]) => uuid === panelUuid);

//   switch (panel[1].type) {
//     case 'LabSet':
//       const data = panel[1].entries
//         .flatMap((x) => x.members.filter((y) => y.conceptClass === testUuid))
//         .sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime));
//       return [data[0].name, data, panel[0]];
//     case 'Test':
//       return [
//         panel[0],
//         panel[1].entries.sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime)),
//         undefined,
//       ];
//   }
// };

const TrendLineBackground = ({ ...props }) => <div {...props} className={styles['Background']} />;

// const withPatientData =
//   (WrappedComponent) =>
//   ({ patientUuid, panelUuid, testUuid, openTimeline: openTimelineExternal }) => {
//     const patientData = useTrendlineData({ patientUuid, panelUuid, testUuid });
//     const openTimeline = React.useCallback(() => openTimelineExternal(panelUuid), [panelUuid, openTimelineExternal]);

//     if (!patientData) return <div>Loading...</div>;

//     return <WrappedComponent patientData={patientData} openTimeline={openTimeline} />;
//   };

const TrendlineHeader = ({ basePath, title, referenceRange }) => {
  const { t } = useTranslation();
  return (
    <div className={styles['header']}>
      <ConfigurableLink to={testResultsBasePath(basePath)} className={styles['back-button']}>
        <Button kind="ghost" renderIcon={ArrowLeft24} iconDescription="Return to timeline">
          <span>{t('backToTimeline', 'Back to timeline')}</span>
        </Button>
      </ConfigurableLink>
      <div className={styles['content']}>
        <span className={styles['title']}>{title}</span>
        <span className={styles['reference-range']}>{referenceRange}</span>
      </div>
    </div>
  );
};

interface TrendlineProps {
  hideTrendlineHeader?: boolean;
}

const Trendline: React.FC<TrendlineProps> = ({ hideTrendlineHeader = false }) => {
  const { trendlineData, basePath } = useContext(FilterContext);
  const { t } = useTranslation();

  const {
    isLoading,
    obs,
    title: chartTitle,
    hiNormal,
    lowNormal,
    bottomAxisTitle,
    leftAxisTitle,
    referenceRange,
  } = trendlineData;

  if (isLoading) {
    <p>Loading...</p>;
  }

  if (!obs.length) {
    return <p>No results found</p>;
  }

  const [range, setRange] = React.useState<[Date, Date]>();

  const [upperRange, lowerRange] = React.useMemo(() => {
    return [new Date(), new Date(Date.parse(obs[obs.length - 1].obsDatetime))];
  }, [obs]);

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
    if (obs && obs.length && graph) {
      graph.insertBefore(graph.children[3], graph.childNodes[2]);
    }
  }, [obs, document]);

  const data: Array<{
    date: Date;
    value: number;
    group: string;
    min?: number;
    max?: number;
  }> = [];

  const tableData: Array<{
    date: string;
    time: string;
    value: number;
    interpretation?: OBSERVATION_INTERPRETATION;
  }> = [];

  const dataset = chartTitle;

  obs.forEach((obs) => {
    const range =
      hiNormal && lowNormal
        ? {
            max: hiNormal,
            min: lowNormal,
          }
        : {};

    data.push({
      date: new Date(Date.parse(obs.obsDatetime)),
      value: obs.value,
      group: chartTitle,
      ...range,
    });

    tableData.push({
      date: formatDate(parseDate(obs.obsDatetime)),
      time: formatTime(parseDate(obs.obsDatetime)),
      value: obs.value,
      interpretation: obs.interpretation,
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
          title: bottomAxisTitle,
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
          title: leftAxisTitle,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      height: '20.125rem',

      color: {
        scale: {
          [chartTitle]: '#6929c4',
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
          `<div class="bx--tooltip bx--tooltip--shown" style="min-width: max-content; font-weight:600">${value} ${leftAxisTitle}<br>
          <span style="color: #c6c6c6; font-size: 0.75rem; font-weight:400">${formatDate(date)}</span></div>`,
      },
    }),
    [bottomAxisTitle, leftAxisTitle, range, chartTitle, ScaleTypes, TickRotations, formatDate],
  );

  const tableHeaderData = React.useMemo(
    () => [
      {
        header: t('date', 'Date'),
        key: 'date',
      },
      {
        header: t('value', 'Value') + ` (${leftAxisTitle})`,
        key: 'value',
      },
      {
        header: t('timeOfTest', 'Time of Test'),
        key: 'time',
      },
    ],
    [leftAxisTitle, t],
  );

  return (
    <>
      {!hideTrendlineHeader && <TrendlineHeader basePath={basePath} title={dataset} referenceRange={referenceRange} />}
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

export default Trendline;
