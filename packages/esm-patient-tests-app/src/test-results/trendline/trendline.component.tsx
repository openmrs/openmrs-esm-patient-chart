import React, { type ComponentProps, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, SkeletonText } from '@carbon/react';
import { LineChart, ScaleTypes, TickRotations } from '@carbon/charts-react';
import { ArrowLeftIcon, ConfigurableLink, formatDate } from '@openmrs/esm-framework';
import { EmptyState, type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { testResultsBasePath } from '../helpers';
import { useObstreeData } from './trendline-resource';
import CommonDataTable from '../overview/common-datatable.component';
import RangeSelector from './range-selector.component';
import styles from './trendline.scss';

interface TrendlineProps {
  basePath: string;
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
  referenceRange: string;
  showBackToTimelineButton: boolean;
  title: string;
}

const TrendlineHeader: React.FC<TrendlineHeaderProps> = ({
  patientUuid,
  title,
  referenceRange,
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
  const { t } = useTranslation();
  const { trendlineData, isLoading, isValidating } = useObstreeData(patientUuid, conceptUuid);
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

  const { data, tableData } = useMemo(() => {
    const chartData: Array<{
      date: Date;
      value: number;
      group: string;
      min?: number;
      max?: number;
    }> = [];

    const table: Array<{
      id: string;
      dateTime: string;
      value: {
        value: number;
        interpretation: OBSERVATION_INTERPRETATION;
      };
    }> = [];

    obs.forEach((observation, idx) => {
      const normalRange =
        hiNormal && lowNormal
          ? {
              max: hiNormal,
              min: lowNormal,
            }
          : {};

      chartData.push({
        date: new Date(Date.parse(observation.obsDatetime)),
        value: parseFloat(observation.value),
        group: chartTitle,
        ...normalRange,
      });

      table.push({
        id: `${idx}`,
        dateTime: observation.obsDatetime,
        value: {
          value: parseFloat(observation.value),
          interpretation: observation.interpretation,
        },
      });
    });

    return { data: chartData, tableData: table };
  }, [obs, chartTitle, hiNormal, lowNormal]);

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
        customHTML: ([{ date, value }]) =>
          `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} ${leftAxisTitle}<br>
          <span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${formatDate(date)}</span></div>`,
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
    return (
      <div className={styles.container}>
        <SkeletonText paragraph={true} lineCount={8} />
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
          referenceRange={referenceRange}
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
