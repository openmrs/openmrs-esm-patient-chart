import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-form.scss';

interface EmptyFormViewProps {
  content: string;
}

const EmptyFormView: React.FC<EmptyFormViewProps> = ({ content }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h4>{t('forms', 'Forms')}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>{content}</p>
      </Tile>
    </Layer>
  );
};

export default EmptyFormView;
