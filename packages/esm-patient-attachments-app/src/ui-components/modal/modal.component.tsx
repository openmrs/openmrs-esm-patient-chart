import React from 'react';
import { useBodyScrollLock } from '@openmrs/esm-patient-common-lib';
import styles from './modal.scss';

export const Modal: React.FC = ({ children }) => {
  useBodyScrollLock(true);
  return <div className={styles.attachmentsModal}>{children}</div>;
};
