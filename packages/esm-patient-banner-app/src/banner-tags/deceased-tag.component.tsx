import React from 'react';
import dayjs from 'dayjs';
import styles from './active-visit-tag.scss';
import { useTranslation } from 'react-i18next';
import { Tag, TooltipDefinition } from 'carbon-components-react';
import { useVisit } from '@openmrs/esm-framework';

function DeceasedBannerTag({ patientUuid}) {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  return (
    currentVisit && (
      <TooltipDefinition
        align="end"
        tooltipText={
          <div className={styles.tooltipPadding}>
            <h6 style={{ marginBottom: '0.5rem' }}>deceased</h6>
           
          </div>
        }
      >
        <Tag type="red">{t('deceased', 'Deceased')}</Tag>
      </TooltipDefinition>
    )
  );
}

export default DeceasedBannerTag;
