import React from 'react';
import classNames from 'classnames';
import { Button, IconButton } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces } from '../workspaces';
import styles from './siderail-nav-button.scss';

interface TagsProps {
  isTablet: boolean;
  getIcon: (props: object) => JSX.Element;
  formOpenInTheBackground: boolean;
  tagContent?: string | React.ReactNode;
}

function Tags({ isTablet, getIcon, formOpenInTheBackground, tagContent }: TagsProps) {
  return (
    <>
      {getIcon({ size: isTablet ? 16 : 20 })}

      {formOpenInTheBackground ? (
        <span className={styles.interruptedTag}>!</span>
      ) : (
        <span className={styles.countTag}>{tagContent}</span>
      )}
    </>
  );
}

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
        <span className={styles.elementContainer}>
          <Tags isTablet formOpenInTheBackground={formOpenInTheBackground} getIcon={getIcon} tagContent={tagContent} />
        </span>
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <IconButton
      align="left"
      aria-label={iconDescription}
      className={classNames(styles.container, {
        [styles.active]: isWorkspaceActive,
      })}
      enterDelayMs={300}
      kind="ghost"
      label={label}
      onClick={handler}
    >
      <div className={styles.elementContainer}>
        <Tags
          isTablet={false}
          formOpenInTheBackground={formOpenInTheBackground}
          getIcon={getIcon}
          tagContent={tagContent}
        />
      </div>
    </IconButton>
  );
};
