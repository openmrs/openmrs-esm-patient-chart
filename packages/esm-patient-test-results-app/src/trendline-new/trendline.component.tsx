import React, { useContext, useState, useCallback, useMemo, useLayoutEffect } from 'react';
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

const TrendLineBackground = ({ ...props }) => <div {...props} className={styles.background} />;

const TrendlineHeader = ({ basePath, title, referenceRange }) => {
  const { t } = useTranslation();
  return (
    <div className={styles['header']}>
      <ConfigurableLink to={testResultsBasePath(basePath)} className={styles['back-button']}>
        <Button kind="ghost" renderIcon={ArrowLeft24} iconDescription={t('returnToTimeline', 'Return to timeline')}>
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

  const [range, setRange] = useState<[Date, Date]>();

  const [upperRange, lowerRange] = useMemo(() => {
    if (obs.length === 0) {
      return [new Date(), new Date()];
    }
    return [new Date(), new Date(Date.parse(obs[obs.length - 1].obsDatetime))];
  }, [obs]);

  const setLowerRange = useCallback(
    (selectedLowerRange: Date) => {
      setRange([selectedLowerRange > lowerRange ? selectedLowerRange : lowerRange, upperRange]);
    },
    [setRange, upperRange, lowerRange],
  );

  /**
   * reorder svg element to bring line in front of the area
   */
  useLayoutEffect(() => {
    const graph = document.querySelector('g.bx--cc--area')?.parentElement;
    if (obs && obs.length && graph) {
      graph.insertBefore(graph.children[3], graph.childNodes[2]);
    }
  }, [obs]);

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

  const options = useMemo<LineChartOptions>(
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
    [bottomAxisTitle, leftAxisTitle, range, chartTitle],
  );

  const tableHeaderData = useMemo(
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

  if (isLoading) {
    return <p>Loading...</p>;
  }

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
