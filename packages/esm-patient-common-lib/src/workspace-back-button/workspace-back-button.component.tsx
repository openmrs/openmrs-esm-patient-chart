import React, { type MouseEventHandler } from 'react';
import { Button } from '@carbon/react';
import { ArrowLeftIcon } from '@openmrs/esm-framework';
import styles from './workspace-back-button.scss';

export interface WorkspaceBackButtonProps {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const WorkspaceBackButton: React.FC<WorkspaceBackButtonProps> = ({ label, onClick }) => {
  return (
    <div className={styles.backButton}>
      <Button kind="ghost" size="sm" onClick={onClick}>
        <ArrowLeftIcon size={16} />
        <span>{label}</span>
      </Button>
    </div>
  );
};
