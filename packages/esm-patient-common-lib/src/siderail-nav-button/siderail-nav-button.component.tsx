import React from 'react';
import { Button } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces } from '../workspaces';
import styles from './siderail-nav-button.scss';

interface SiderailNavButtonProps {
  name: string;
  getIcon: (props: Object) => JSX.Element;
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
  const isWorkspaceActive =
    (workspaceWindowState === 'normal' || workspaceWindowState === 'maximized') && workspaceIndex === 0;

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isWorkspaceActive && styles.active}`}
        role="button"
        tabIndex={0}
        onClick={handler}
      >
        <div className={styles.elementContainer}>
          {getIcon({ size: 16 })}
          {tagContent && <span className={styles.countTag}>{tagContent}</span>}
        </div>

        <span>{label}</span>
      </Button>
    );
  }

  return (
    <Button
      className={`${styles.container} ${isWorkspaceActive && styles.active}`}
      onClick={handler}
      hasIconOnly
      kind="ghost"
      renderIcon={(props) => (
        <div className={styles.elementContainer}>
          {getIcon({ size: 20, ...props })}
          {tagContent && <span className={styles.countTag}>{tagContent}</span>}
        </div>
      )}
      iconDescription={iconDescription}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};
