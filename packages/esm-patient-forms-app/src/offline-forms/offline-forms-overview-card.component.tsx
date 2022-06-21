import { navigate } from '@openmrs/esm-framework';
import { Tile, Button, SkeletonText } from 'carbon-components-react';
import React, { ReactNode } from 'react';
import styles from './offline-forms-overview-card.styles.scss';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import { useTranslation } from 'react-i18next';
import { useDynamicFormDataEntries } from './offline-form-helpers';

const OfflineFormsOverviewCard: React.FC = () => {
  const { t } = useTranslation();
  const { data, error } = useDynamicFormDataEntries();

  return (
    <Tile light className={`${styles.overviewCard}`}>
      <div className={styles.headerContainer}>
        <h3 className={styles.productiveHeading01}>Forms</h3>
        <Button
          kind="ghost"
          renderIcon={ArrowRight16}
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
