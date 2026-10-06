import React, { type MouseEventHandler } from 'react';
import { Button } from '@carbon/react';
import { ArrowLeftIcon } from '@openmrs/esm-framework';
import styles from './workspace-back-button.scss';

export interface WorkspaceBackButtonProps {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const WorkspaceBackButton: React.FC<WorkspaceBackButtonProps> = ({ label, onClick, className }) => {
  return (
    <div
      className={className ? `${styles.backButton} ${className}` : styles.backButton}
      data-testid="workspace-back-button"
    >
      <Button kind="ghost" size="sm" onClick={onClick}>
        <ArrowLeftIcon size={24} className={styles.icon} />
        <span>{label}</span>
      </Button>
    </div>
  );
};

export default WorkspaceBackButton;
