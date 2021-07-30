import React, { useEffect, useState } from 'react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import Maximize16 from '@carbon/icons-react/es/maximize/16';
import Minimize16 from '@carbon/icons-react/es/minimize/16';
import styles from './context-workspace.scss';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBodyScrollLock } from '@openmrs/esm-patient-common-lib';
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderName } from 'carbon-components-react/es/components/UIShell';
import { useWorkspace } from '../hooks/useWorkspace';
import { patientChartWorkspaceSlot } from '../constants';
import { isDesktop } from '../utils';

type WindowSize = 'maximize' | 'normal' | 'hide';
type ActionTypes = 'minimize' | 'maximize' | 'hide' | 'reopen';

const reducer = (state: WindowSize, action: ActionTypes) => {
  switch (action) {
    case 'maximize':
      return 'maximize';
    case 'minimize':
      return 'normal';
    case 'hide':
      return 'hide';
    case 'reopen':
      return 'normal';
  }
};

interface ContextWorkspaceParams {
  patientUuid: string;
}

const ContextWorkspace: React.FC<RouteComponentProps<ContextWorkspaceParams>> = ({ match }) => {
  const layout = useLayoutType();
  const { patientUuid } = match.params;
  const { t } = useTranslation();
  const isTablet = layout === 'tablet';
  const { active, title, closeWorkspace, extensions } = useWorkspace();
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, 'normal');
  const props = React.useMemo(
    () => ({ closeWorkspace, patientUuid, isTablet }),
    [closeWorkspace, isTablet, patientUuid],
  );
  const [openContextWorkspace, setOpenContextWorkspace] = useState(false);

  useEffect(() => {
    extensions.length > 0 && updateContextWorkspaceWindowSize('reopen');
  }, [extensions.length]);

  useEffect(() => {
    if (
      extensions.length > 0 &&
      (contextWorkspaceWindowSize === 'maximize' || contextWorkspaceWindowSize === 'normal')
    ) {
      setOpenContextWorkspace(true);
    } else if (extensions.length > 0 && contextWorkspaceWindowSize === 'hide') {
      setOpenContextWorkspace(false);
    } else {
      setOpenContextWorkspace(false);
    }
  }, [extensions.length, contextWorkspaceWindowSize]);

  useBodyScrollLock(active && !isDesktop(layout));

  const Icon = contextWorkspaceWindowSize === 'maximize' ? Minimize16 : Maximize16;

  return (
    <aside
      className={`${styles.contextWorkspaceContainer} ${openContextWorkspace ? styles.show : styles.hide} ${
        contextWorkspaceWindowSize === 'maximize' && styles.maximized
      }`}>
      <Header aria-label={title} style={{ position: 'sticky' }}>
        <HeaderName prefix="">{title}</HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            onClick={() => {
              contextWorkspaceWindowSize === 'maximize'
                ? updateContextWorkspaceWindowSize('minimize')
                : updateContextWorkspaceWindowSize('maximize');
            }}
            aria-label={t('maximize', 'Maximize')}
            title={t('maximize', 'Maximize')}>
            <Icon />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label={t('hide', 'Hide workspace')}
            title={t('hide', 'Hide workspace')}
            onClick={() => updateContextWorkspaceWindowSize('hide')}>
            <ArrowRight16 />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <ExtensionSlot extensionSlotName={patientChartWorkspaceSlot} state={props} />
    </aside>
  );
};

export default ContextWorkspace;
