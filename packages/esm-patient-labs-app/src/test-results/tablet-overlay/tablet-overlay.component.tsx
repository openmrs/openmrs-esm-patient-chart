import React, { type ComponentProps } from 'react';
import { Button, Header } from '@carbon/react';
import { ArrowLeftIcon } from '@openmrs/esm-framework';
import styles from './tablet-overlay.scss';

interface OverlayProps {
  children?: React.ReactNode;
  close: () => void;
  headerText: string | React.ReactElement;
  buttonsGroup?: React.ReactElement;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, headerText, buttonsGroup }) => (
  <div className={styles.tabletOverlay}>
    <Header className={styles.tabletOverlayHeader}>
      <Button
        onClick={close}
        icon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={16} {...props} />}
      />
      <div className={styles.headerContent}>{headerText}</div>
    </Header>
    <div className={styles.overlayContent}>{children}</div>
    <div className={styles.buttonsGroup}>{buttonsGroup}</div>
  </div>
);

export default Overlay;
