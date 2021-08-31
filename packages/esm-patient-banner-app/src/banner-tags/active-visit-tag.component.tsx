import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Tag from 'carbon-components-react/es/components/Tag';
import TooltipDefinition from 'carbon-components-react/es/components/TooltipDefinition';
import { useVisit } from '@openmrs/esm-framework';
import styles from './active-visit-tag.scss';

function ActiveVisitBannerTag({ patientUuid }) {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  return (
    currentVisit && (
      <TooltipDefinition
        align="end"
        tooltipText={
          <div className={styles.tooltipPadding}>
            <h6 style={{ marginBottom: '0.5rem' }}>{currentVisit?.visitType?.name}</h6>
            <span>
              <span className={styles.tooltipSmallText}>Started: </span>
              <span>{dayjs(currentVisit?.startDatetime).format('DD - MMM - YYYY @ HH:mm')}</span>
            </span>
          </div>
        }>
        <Tag type="blue">{t('activeVisit', 'Active Visit')}</Tag>
      </TooltipDefinition>
    )
  );
}

export default ActiveVisitBannerTag;
