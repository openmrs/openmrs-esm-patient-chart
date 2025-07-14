import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header, IconButton } from '@carbon/react';
import { ArrowLeftIcon } from '@openmrs/esm-framework';
import styles from './tablet-overlay.scss';

interface OverlayProps {
  children?: React.ReactNode;
  close: () => void;
  headerText: string | React.ReactElement;
  buttonsGroup?: React.ReactElement;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, headerText, buttonsGroup }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.tabletOverlay}>
      <Header aria-label={typeof headerText === 'string' ? headerText : ''} className={styles.tabletOverlayHeader}>
        <IconButton className={styles.backButton} label={t('back', 'Back')} onClick={close}>
          <ArrowLeftIcon size={16} />
        </IconButton>
        <div className={styles.headerContent}>{headerText}</div>
      </Header>
      <div className={styles.overlayContent}>{children}</div>
      <div className={styles.buttonsGroup}>{buttonsGroup}</div>
    </div>
  );
};

export default Overlay;
