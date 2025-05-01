import React, { useCallback } from 'react';
import { Button, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { type OverviewPanelEntry } from './useOverviewData';
import { useTranslation } from 'react-i18next';
import { formatDatetime, navigate } from '@openmrs/esm-framework';
import CommonDataTable from './common-datatable.component';
import styles from './common-overview.scss';

const DashboardResultsCount = 5;

interface CommonOverviewProps {
  patientUuid?: string;
  overviewData: Array<OverviewPanelEntry>;
}

const CommonOverview: React.FC<CommonOverviewProps> = ({ patientUuid, overviewData = [] }) => {
  const { t } = useTranslation();

  const headers = [
    { key: 'name', header: 'Test Name' },
    { key: 'value', header: 'Value' },
    { key: 'range', header: 'Reference Range' },
  ];

  const handleSeeAvailableResults = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/Results` });
  }, [patientUuid]);

  if (!overviewData.length)
    return (
      <EmptyState headerTitle={t('testResults_title', 'Test Results')} displayText={t('testResults', 'test results')} />
    );

  return (
    <>
      {(() => {
        const cards = overviewData.map(([title, type, data, effectiveDateTime, issuedDateTime, uuid]) => (
          <article key={uuid}>
            <CommonDataTable
              {...{
                title,
                data,
                description: (
                  <div>
                    <div className={styles.meta}>
                      {formatDatetime(effectiveDateTime, { mode: 'wide' })}
                      <InfoTooltip effectiveDateTime={effectiveDateTime} issuedDateTime={issuedDateTime} />
                    </div>
                  </div>
                ),
                tableHeaders: headers,
              }}
            />
            {data.length > DashboardResultsCount && (
              <Button onClick={handleSeeAvailableResults} kind="ghost">
                {t('moreResultsAvailable', 'More results available')}
              </Button>
            )}
          </article>
        ));

        return cards.reduce((acc, val, i, { length }) => {
          acc.push(val);

          if (i < length - 1) {
            acc.push(<Separator key={i} />);
          }

          return acc;
        }, []);
      })()}
    </>
  );
};

const Separator = ({ ...props }) => <div {...props} className={styles.separator} />;

const InfoTooltip = ({ effectiveDateTime, issuedDateTime }) => {
  const { t } = useTranslation();
  return (
    <Toggletip align="bottom" className={styles.tooltipContainer}>
      <ToggletipButton label="Additional information">
        <Information />
      </ToggletipButton>
      <ToggletipContent>
        <div className={styles.tooltip}>
          <p>{t('dateCollected', 'Displaying date collected')}</p>
          <p>
            <span className={styles.label}>{t('ordered', 'Ordered')}: </span>{' '}
            {formatDatetime(effectiveDateTime, { mode: 'wide' })}
          </p>
          <p>
            <span className={styles.label}>{t('resulted', 'Resulted')}: </span>{' '}
            {formatDatetime(issuedDateTime, { mode: 'wide' })}
          </p>
        </div>
      </ToggletipContent>
    </Toggletip>
  );
};

export default CommonOverview;
