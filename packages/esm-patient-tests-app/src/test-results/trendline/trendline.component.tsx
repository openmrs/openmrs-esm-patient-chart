import React, { type ComponentProps, useState, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, SkeletonPlaceholder, SkeletonText } from '@carbon/react';
import { LineChart, ScaleTypes, TickRotations } from '@carbon/charts-react';
import { ArrowLeftIcon, ConfigurableLink, formatDate } from '@openmrs/esm-framework';
import { EmptyState, type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { testResultsBasePath } from '../helpers';
import { useObstreeData } from './trendline-resource';
import { formatReferenceRange } from '../grouped-timeline/reference-range-helpers';
import CommonDataTable from '../overview/common-datatable.component';
import RangeSelector from './range-selector.component';
import styles from './trendline.scss';

interface TrendlineProps {
  conceptUuid: string;
  patientUuid: string;
  hideTrendlineHeader?: boolean;
  showBackToTimelineButton?: boolean;
}

interface TrendLineBackgroundProps {
  children?: React.ReactNode;
}

const TrendLineBackground: React.FC<TrendLineBackgroundProps> = ({ ...props }) => (
  <div {...props} className={styles.background} />
);

interface TrendlineHeaderProps {
  isValidating: boolean;
  patientUuid: string;
  showBackToTimelineButton: boolean;
  title: string;
}

const TrendlineHeader: React.FC<TrendlineHeaderProps> = ({
  patientUuid,
  title,
  isValidating,
  showBackToTimelineButton,
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.backButton}>
        {showBackToTimelineButton && (
          <ConfigurableLink to={testResultsBasePath(`/patient/${patientUuid}/chart`)}>
            <Button
              iconDescription={t('returnToTimeline', 'Return to timeline')}
              kind="ghost"
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
            >
              <span>{t('backToTimeline', 'Back to timeline')}</span>
            </Button>
          </ConfigurableLink>
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
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
  const { t } = useTranslation();
  const { trendlineData, isLoading, isValidating } = useObstreeData(patientUuid, conceptUuid);
  const { obs, display: chartTitle, hiNormal, lowNormal, units: leftAxisTitle } = trendlineData;
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

  useEffect(() => {
    setRange(undefined);
  }, [conceptUuid]);

  const { data, tableData } = useMemo(() => {
    const chartData: Array<{
      date: Date;
      value: number;
      group: string;
      min?: number;
      max?: number;
      rangeLabel?: string;
    }> = [];

    const table: Array<{
      id: string;
      dateTime: string;
      range: string;
      value: {
        value: number;
        interpretation: OBSERVATION_INTERPRETATION;
      };
    }> = [];

    obs.forEach((observation, idx) => {
      const resolvedLow = observation.lowNormal ?? lowNormal;
      const resolvedHigh = observation.hiNormal ?? hiNormal;
      const hasRange = resolvedLow !== undefined && resolvedHigh !== undefined;
      const normalRange = hasRange
        ? {
            max: resolvedHigh,
            min: resolvedLow,
          }
        : {};
      const rangeLabel = formatReferenceRange(
        hasRange
          ? {
              lowNormal: resolvedLow,
              hiNormal: resolvedHigh,
              units: leftAxisTitle,
            }
          : null,
        leftAxisTitle,
      );

      chartData.push({
        date: new Date(Date.parse(observation.obsDatetime)),
        value: parseFloat(observation.value),
        group: chartTitle,
        ...normalRange,
        rangeLabel,
      });

      table.push({
        id: `${idx}`,
        dateTime: observation.obsDatetime,
        range: rangeLabel,
        value: {
          value: parseFloat(observation.value),
          interpretation: observation.interpretation,
        },
      });
    });

    return { data: chartData, tableData: table };
  }, [obs, chartTitle, hiNormal, leftAxisTitle, lowNormal]);

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
      height: '400px',
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
        customHTML: ([{ date, value, rangeLabel }]) => {
          const valueLabel = t('trendlineTooltipValue', 'Value');
          const dateLabel = t('trendlineTooltipDate', 'Date');
          const rangeLabelText = t('trendlineTooltipRange', 'Range');
          return `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">
            <div style="font-size:1rem; line-height:1.4">${valueLabel}: <span>${value} ${leftAxisTitle}</span></div>
            <div style="font-size:0.875rem; font-weight:500; margin-top:0.125rem">${rangeLabelText}: ${
              rangeLabel || '--'
            }</div>
            <div style="color:#6F6F6F; font-size:0.875rem; font-weight:500; margin-top:0.125rem">${dateLabel}: ${formatDate(date)}</div>
          </div>`;
        },
      },
      toolbar: {
        enabled: true,
        numberOfIcons: 4,
        controls: [
          {
            type: 'Zoom in',
          },
          {
            type: 'Zoom out',
          },
          {
            type: 'Reset zoom',
          },
          {
            type: 'Export as CSV',
          },
          {
            type: 'Export as PNG',
          },
          {
            type: 'Make fullscreen',
          },
        ],
      },
      zoomBar: {
        top: {
          enabled: true,
        },
      },
    }),
    [bottomAxisTitle, leftAxisTitle, range, chartTitle, t],
  );

  const tableHeaderData = useMemo(
    () => [
      {
        header: t('dateTime', 'Date and time'),
        key: 'dateTime',
      },
      {
        header: leftAxisTitle ? `${t('value', 'Value')} (${leftAxisTitle})` : t('value', 'Value'),
        key: 'value',
      },
      {
        header: t('referenceRange', 'Reference range'),
        key: 'range',
      },
    ],
    [leftAxisTitle, t],
  );

  if (isLoading) {
    return (
      <div className={styles.container} data-testid="trendline-loading">
        <div className={styles.loadingHeader} data-testid="trendline-loading-header">
          <SkeletonText heading={true} />
        </div>
        <div className={styles.loadingTabs} data-testid="trendline-loading-tabs">
          <SkeletonText paragraph={true} lineCount={1} />
        </div>
        <SkeletonPlaceholder className={styles.loadingChart} data-testid="trendline-loading-chart" />
      </div>
    );
  }

  if (obs.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState displayText={t('observationsDisplayText', 'observations')} headerTitle={chartTitle} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!hideTrendlineHeader && (
        <TrendlineHeader
          isValidating={isValidating}
          patientUuid={patientUuid}
          showBackToTimelineButton={showBackToTimelineButton}
          title={chartTitle}
        />
      )}
      <TrendLineBackground>
        <RangeSelector setLowerRange={setLowerRange} upperRange={upperRange} />
        <LineChart data={data} options={chartOptions} />
      </TrendLineBackground>

      <div className={styles.tableControls}>
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
    </div>
  );
};

interface DrawTableProps {
  tableData: Array<{
    id: string;
    dateTime: string;
    range: string;
    value: {
      value: number;
      interpretation: OBSERVATION_INTERPRETATION;
    };
  }>;
  tableHeaderData: Array<{
    header: string;
    key: string;
  }>;
}

const DrawTable = React.memo<DrawTableProps>(({ tableData, tableHeaderData }) => {
  return <CommonDataTable data={tableData as any} tableHeaders={tableHeaderData} />;
});

DrawTable.displayName = 'DrawTable';

export default Trendline;
