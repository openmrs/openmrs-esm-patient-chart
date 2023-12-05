import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, Tile, SkeletonText } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { useDynamicFormDataEntries } from './offline-form-helpers';
import styles from './offline-forms-overview-card.scss';

const OfflineFormsOverviewCard: React.FC = () => {
  const { t } = useTranslation();
  const { data, error } = useDynamicFormDataEntries();

  return (
    <Layer>
      <Tile className={styles.overviewCard}>
        <div className={styles.headerContainer}>
          <h3 className={styles.heading}>{t('forms', 'Forms')}</h3>
          <Button
            className={styles.viewButton}
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            size="sm"
            onClick={() => navigate({ to: `\${openmrsSpaBase}/offline-tools/forms` })}
          >
            {t('homeOverviewCardView', 'View')}
          </Button>
        </div>
        <div className={styles.contentContainer}>
          <HeaderedQuickInfo
            header={t('offlineFormsOverviewCardAvailableOffline', 'Available offline')}
            isLoading={!error && !data}
          >
            {error ? 'Unknown' : data?.length}
          </HeaderedQuickInfo>
        </div>
      </Tile>
    </Layer>
  );
};

export interface HeaderedQuickInfoProps {
  header: string;
  isLoading?: boolean;
  children?: ReactNode;
}

const HeaderedQuickInfo: React.FC<HeaderedQuickInfoProps> = ({ header, children, isLoading = false }) => {
  return (
    <div>
      <h4 className={styles.label01}>{header}</h4>
      {isLoading ? <SkeletonText heading /> : <span className={styles.productiveHeading04}>{children}</span>}
    </div>
  );
};

export default OfflineFormsOverviewCard;
