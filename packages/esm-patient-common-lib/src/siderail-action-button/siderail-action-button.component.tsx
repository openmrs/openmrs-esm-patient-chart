import React from 'react';
import { Button } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces } from '../workspaces';
import styles from './siderail-action-button.scss';
import { useWorkspaceNavButtons } from './useSiderailActionButton';

interface SiderailActionButtonProps {
  name: string;
  getIcon: (props: Object) => JSX.Element;
  label: string;
  iconDescription: string;
  handler: () => void;
  workspaceMatcher: RegExp | string | ((name: string) => boolean);
}

export const SiderailActionButton: React.FC<SiderailActionButtonProps> = ({
  name,
  getIcon,
  label,
  iconDescription,
  handler,
  workspaceMatcher,
}) => {
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
  const { showAlertBadge } = useWorkspaceNavButtons(name);

  const workspaceIndex =
    workspaces?.findIndex(({ name }) =>
      typeof workspaceMatcher === 'function' ? workspaceMatcher(name) : name?.match(workspaceMatcher),
    ) ?? -1;
  const isWorkspaceActive = workspaceIndex === 0;

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isWorkspaceActive && styles.active}`}
        role="button"
        tabIndex={0}
        onClick={handler}
      >
        {getIcon({ size: 16 })}
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
      renderIcon={(props) => getIcon({ size: 20, ...props })}
      iconDescription={iconDescription}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};
