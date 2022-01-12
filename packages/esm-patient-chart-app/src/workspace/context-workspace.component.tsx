import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Header, HeaderGlobalBar, HeaderName } from 'carbon-components-react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import Maximize16 from '@carbon/icons-react/es/maximize/16';
import Minimize16 from '@carbon/icons-react/es/minimize/16';
import { ExtensionSlot, useLayoutType, useBodyScrollLock } from '@openmrs/esm-framework';
import { isDesktop } from '../utils';
import { useContextWorkspace } from '../hooks/useContextWindowSize';
import { useWorkspace } from '../hooks/useWorkspace';
import { patientChartWorkspaceHeaderSlot, patientChartWorkspaceSlot } from '../constants';
import { WorkspaceWindowState } from '../types';
import styles from './context-workspace.scss';

interface ContextWorkspaceParams {
  patientUuid: string;
}

const ContextWorkspace: React.FC<RouteComponentProps<ContextWorkspaceParams>> = ({ match }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';

  const { patientUuid } = match.params;
  const { active, title, closeWorkspace, extensions } = useWorkspace();
  const { windowSize, updateWindowSize } = useContextWorkspace();
  const { size } = windowSize;

  const hidden = size === WorkspaceWindowState.hidden;
  const maximized = size === WorkspaceWindowState.maximized;
  const normal = size === WorkspaceWindowState.normal;

  const props = React.useMemo(
    () => ({ closeWorkspace, patientUuid, isTablet }),
    [closeWorkspace, isTablet, patientUuid],
  );

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  useEffect(() => {
    if (extensions.length && (maximized || normal)) {
      setIsWorkspaceOpen(true);
    } else if (extensions.length && hidden) {
      setIsWorkspaceOpen(false);
    } else {
      setIsWorkspaceOpen(false);
    }
  }, [extensions.length, hidden, maximized, normal]);

  useBodyScrollLock(active && !isDesktop(layout));

  const toggleWindowState = () => {
    maximized ? updateWindowSize(WorkspaceWindowState.minimized) : updateWindowSize(WorkspaceWindowState.maximized);
  };

  return (
    <aside
      className={`${styles.container} ${maximized ? `${styles.maximized}` : undefined} ${
        isWorkspaceOpen
          ? `${styles.show}`
          : `${styles.hide}
      }`
      }`}
    >
      <Header
        aria-label="Workspace Title"
        className={`${styles.header} ${maximized ? `${styles.fullWidth}` : `${styles.dynamicWidth}`}`}
      >
        <HeaderName prefix="">{title}</HeaderName>
        <HeaderGlobalBar>
          <ExtensionSlot extensionSlotName={patientChartWorkspaceHeaderSlot} state={props} />
          <Button
            iconDescription={maximized ? t('minimize', 'Minimize') : t('maximize', 'Maximize')}
            hasIconOnly
            kind="ghost"
            onClick={toggleWindowState}
            renderIcon={maximized ? Minimize16 : Maximize16}
            tooltipPosition="bottom"
          />
          <Button
            iconDescription={t('hide', 'Hide')}
            hasIconOnly
            kind="ghost"
            onClick={() => updateWindowSize(WorkspaceWindowState.hidden)}
            renderIcon={ArrowRight16}
            tooltipPosition="bottom"
            tooltipAlignment="end"
          />
        </HeaderGlobalBar>
      </Header>
      <ExtensionSlot
        className={`${styles.fixed} ${maximized && !isTablet ? `${styles.fullWidth}` : `${styles.dynamicWidth}`}`}
        extensionSlotName={patientChartWorkspaceSlot}
        state={props}
      />
    </aside>
  );
};

export default ContextWorkspace;
