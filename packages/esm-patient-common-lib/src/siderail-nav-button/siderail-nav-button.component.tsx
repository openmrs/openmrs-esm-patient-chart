import React from 'react';
import classNames from 'classnames';
import { Button, IconButton } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces } from '../workspaces';
import styles from './siderail-nav-button.scss';

interface SiderailNavButtonProps {
  name: string;
  getIcon: (props: object) => JSX.Element;
  label: string;
  iconDescription: string;
  handler: () => void;
  type: string;
  tagContent?: string | React.ReactNode;
}

export const SiderailNavButton: React.FC<SiderailNavButtonProps> = ({
  name,
  getIcon,
  label,
  iconDescription,
  handler,
  type,
  tagContent,
}) => {
  const layout = useLayoutType();
  const { workspaces, workspaceWindowState } = useWorkspaces();
  const workspaceIndex = workspaces?.findIndex(({ type: workspaceType }) => workspaceType === type) ?? -1;
  const isWorkspaceActive = workspaceWindowState !== 'hidden' && workspaceIndex === 0;
  const formOpenInTheBackground = workspaceIndex > 0 || (workspaceIndex === 0 && workspaceWindowState === 'hidden');

  if (layout === 'tablet') {
    return (
      <Button
        className={classNames(styles.container, { [styles.active]: isWorkspaceActive })}
        iconDescription={iconDescription}
        kind="ghost"
        onClick={handler}
        role="button"
        tabIndex={0}
      >
        <div className={styles.elementContainer}>
          {getIcon({ size: 16 })}
          <span className={styles.countTag}>{formOpenInTheBackground ? '!' : tagContent}</span>
        </div>

        <span>{label}</span>
      </Button>
    );
  }

  return (
    <IconButton
      align="left"
      className={classNames(styles.container, {
        [styles.active]: isWorkspaceActive,
      })}
      kind="ghost"
      label={label}
      onClick={handler}
    >
      <div className={styles.elementContainer}>
        {getIcon({ size: 20 })}
        <span className={styles.countTag}>{formOpenInTheBackground ? '!' : tagContent}</span>
      </div>
    </IconButton>
  );
};
