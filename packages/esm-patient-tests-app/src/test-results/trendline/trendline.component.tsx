import React, { type ComponentProps, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, SkeletonText } from '@carbon/react';
import { LineChart, ScaleTypes, TickRotations } from '@carbon/charts-react';
import { ArrowLeftIcon, ConfigurableLink, formatDate } from '@openmrs/esm-framework';
import { EmptyState, type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { useObstreeData } from './trendline-resource';
import { testResultsBasePath } from '../helpers';
import CommonDataTable from '../overview/common-datatable.component';
import RangeSelector from './range-selector.component';
import styles from './trendline.scss';

interface TrendlineProps {
  patientUuid: string;
  conceptUuid: string;
  basePath: string;
  hideTrendlineHeader?: boolean;
  showBackToTimelineButton?: boolean;
}

const TrendLineBackground = ({ ...props }) => <div {...props} className={styles.background} />;

const TrendlineHeader = ({ patientUuid, title, referenceRange, isValidating, showBackToTimelineButton }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.backButton}>
        {showBackToTimelineButton && (
          <ConfigurableLink to={testResultsBasePath(`/patient/${patientUuid}/chart`)}>
            <Button
              kind="ghost"
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              iconDescription={t('returnToTimeline', 'Return to timeline')}
            >
              <span>{t('backToTimeline', 'Back to timeline')}</span>
            </Button>
          </ConfigurableLink>
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles['reference-range']}>{referenceRange}</span>
      </div>
      <div>{isValidating && <InlineLoading className={styles.inlineLoader} />}</div>
    </div>
  );
};

const Trendline: React.FC<TrendlineProps> = ({
  patientUuid,
  conceptUuid,
  hideTrendlineHeader = false,
  showBackToTimelineButton = false,
}) => {
  const { trendlineData, isLoading, isValidating } = useObstreeData(patientUuid, conceptUuid);
  const { t } = useTranslation();
  const { obs, display: chartTitle, hiNormal, lowNormal, units: leftAxisTitle, range: referenceRange } = trendlineData;
  const bottomAxisTitle = t('date', 'Date');
  const [range, setRange] = useState<[Date, Date]>();
  const [showResultsTable, setShowResultsTable] = useState(false);

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
    const graph = document.querySelector('g.cds--cc--area')?.parentElement;
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
    id: string;
    dateTime: string;
    value:
      | number
      | {
          value: number;
          interpretation: OBSERVATION_INTERPRETATION;
        };
  }> = [];

  const dataset = chartTitle;

  obs.forEach((obs, idx) => {
    const range =
      hiNormal && lowNormal
        ? {
            max: hiNormal,
            min: lowNormal,
          }
        : {};

    data.push({
      date: new Date(Date.parse(obs.obsDatetime)),
      value: parseFloat(obs.value),
      group: chartTitle,
      ...range,
    });

    tableData.push({
      id: `${idx}`,
      dateTime: obs.obsDatetime,
      value: {
        value: parseFloat(obs.value),
        interpretation: obs.interpretation,
      },
    });
  });

  const chartOptions = useMemo(
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
          `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} ${leftAxisTitle}<br>
          <span style="color: #c6c6c6; font-size: 0.75rem; font-weight:400">${formatDate(date)}</span></div>`,
      },
    }),
    [bottomAxisTitle, leftAxisTitle, range, chartTitle],
  );

  const tableHeaderData = useMemo(
    () => [
      {
        header: t('dateTime', 'Date and time'),
        key: 'dateTime',
      },
      {
        header: `${t('value', 'Value')} (${leftAxisTitle})`,
        key: 'value',
      },
    ],
    [leftAxisTitle, t],
  );

  if (isLoading) {
    return <SkeletonText />;
  }

  if (obs.length === 0) {
    return <EmptyState displayText={t('observationsDisplayText', 'observations')} headerTitle={chartTitle} />;
  }

  return (
    <div className={styles.container}>
      {!hideTrendlineHeader && (
        <TrendlineHeader
          showBackToTimelineButton={showBackToTimelineButton}
          isValidating={isValidating}
          patientUuid={patientUuid}
          title={dataset}
          referenceRange={referenceRange}
        />
      )}
      <TrendLineBackground>
        <RangeSelector setLowerRange={setLowerRange} upperRange={upperRange} />
        <LineChart data={data} options={chartOptions} />
      </TrendLineBackground>

      {showResultsTable ? (
        <>
          <Button className={styles['show-hide-table']} kind="ghost" onClick={() => setShowResultsTable(false)}>
            {t('hideResultsTable', 'Hide results table')}
          </Button>
          <DrawTable {...{ tableData, tableHeaderData }} />
        </>
      ) : (
        <Button className={styles['show-hide-table']} kind="ghost" onClick={() => setShowResultsTable(true)}>
          {t('showResultsTable', 'Show results table')}
        </Button>
      )}
    </div>
  );
};

const DrawTable = React.memo<{ tableData; tableHeaderData }>(({ tableData, tableHeaderData }) => {
  return <CommonDataTable data={tableData} tableHeaders={tableHeaderData} />;
});

export default Trendline;
