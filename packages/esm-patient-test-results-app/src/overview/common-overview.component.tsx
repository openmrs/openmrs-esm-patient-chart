import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import Table16 from '@carbon/icons-react/es/table/16';
import ChartLine16 from '@carbon/icons-react/es/chart--line/16';
import { Button, TableToolbarContent, TableToolbar, Tooltip } from 'carbon-components-react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { OverviewPanelEntry } from './useOverviewData';
import { useTranslation } from 'react-i18next';
import { navigate } from '@openmrs/esm-framework';
import CommonDataTable from './common-datatable.component';
import styles from './common-overview.scss';

const DashboardResultsCount = 5;

interface CommonOverviewPropsBase {
  overviewData: Array<OverviewPanelEntry>;
  insertSeparator?: boolean;
  patientUuid?: string;
}

interface CommonOverviewPropsWithToolbar {
  openTimeline: (panelUuid: string) => void;
  openTrendline: (panelUuid: string, testUuid: string) => void;
}

interface CommonOverviewPropsWithoutToolbar {
  hideToolbar: true;
}

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof Omit<U, keyof T>]?: never;
};

type Either<T, U> = Only<T, U> | Only<U, T>;

type CommonOverviewProps = CommonOverviewPropsBase &
  Either<CommonOverviewPropsWithToolbar, CommonOverviewPropsWithoutToolbar>;

const CommonOverview: React.FC<CommonOverviewProps> = ({
  overviewData = [],
  openTimeline,
  openTrendline,
  insertSeparator = false,
  hideToolbar = false,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const [activeCardUuid, setActiveCardUuid] = React.useState('');

  const headers = [
    { key: 'name', header: 'Test Name' },
    { key: 'value', header: 'Value' },
    { key: 'range', header: 'Reference Range' },
  ];

  const isActiveCard = useCallback(
    (uuid: string) =>
      activeCardUuid === uuid || (!activeCardUuid && uuid === overviewData[0][overviewData[0].length - 1]),
    [activeCardUuid, overviewData],
  );

  const handleSeeAvailableResults = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/test-results` });
  }, [patientUuid]);

  if (!overviewData.length)
    return <EmptyState headerTitle={t('testResults', 'Test Results')} displayText={t('testResults', 'test results')} />;

  return (
    <>
      {(() => {
        const cards = overviewData.map(([title, type, data, effectiveDateTime, issuedDateTime, uuid]) => (
          <article
            key={uuid}
            className={insertSeparator ? '' : `${styles.card} ${isActiveCard(uuid) ? styles.activeCard : ''}`}
          >
            <CommonDataTable
              {...{
                title,
                data,
                description: (
                  <div className={insertSeparator ? '' : styles.cardHeader}>
                    <div className={styles.meta}>
                      {formatDate(effectiveDateTime)}
                      <InfoTooltip effectiveDateTime={effectiveDateTime} issuedDateTime={issuedDateTime} />
                    </div>
                  </div>
                ),
                tableHeaders: headers,
                toolbar: hideToolbar || (
                  <TableToolbar>
                    <TableToolbarContent>
                      {type === 'Test' && (
                        <Button
                          kind="ghost"
                          renderIcon={ChartLine16}
                          onClick={() => {
                            setActiveCardUuid(uuid);
                            openTrendline(uuid, uuid);
                          }}
                        >
                          {t('trend', 'Trend')}
                        </Button>
                      )}
                      <Button
                        kind="ghost"
                        renderIcon={Table16}
                        onClick={() => {
                          setActiveCardUuid(uuid);
                          openTimeline(uuid);
                        }}
                      >
                        {t('timeline', 'Timeline')}
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>
                ),
              }}
            />
            {data.length > DashboardResultsCount && insertSeparator && (
              <Button onClick={handleSeeAvailableResults} kind="ghost">
                {t('moreResultsAvailable', 'More results available')}
              </Button>
            )}
          </article>
        ));

        if (insertSeparator)
          return cards.reduce((acc, val, i, { length }) => {
            acc.push(val);

            if (i < length - 1) {
              acc.push(<Separator key={i} />);
            }

            return acc;
          }, []);

        return cards;
      })()}
    </>
  );
};

const Separator = ({ ...props }) => <div {...props} className={styles.separator} />;

const InfoTooltip = ({ effectiveDateTime, issuedDateTime }) => {
  const { t } = useTranslation();
  return (
    <Tooltip align="start">
      <div className={styles.tooltip}>
        <p>{t('dateCollected', 'Displaying date collected')}</p>
        <p>
          <span className={styles.label}>{t('resulted', 'Resulted')}: </span> {formatDate(issuedDateTime)}
        </p>
        <p>
          <span className={styles.label}>{t('ordered', 'Ordered')}: </span> {formatDate(effectiveDateTime)}
        </p>
      </div>
    </Tooltip>
  );
};

function formatDate(date: Date) {
  return dayjs(date).format('DD - MMM - YYYY · HH:mm');
}

export default CommonOverview;
