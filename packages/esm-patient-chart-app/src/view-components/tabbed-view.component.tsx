import React, { useEffect } from 'react';
import styles from './tabbed-view.css';
import {
  ConfigurableLink,
  ExtensionSlot,
  navigate,
  extensionStore,
  useAssignedExtensionIds,
  translateFrom,
  ExtensionRegistration,
} from '@openmrs/esm-framework';
import { useRouteMatch } from 'react-router-dom';
import { DashboardTabConfig } from '../config-schemas';
import { basePath } from '../constants';

interface ShowTabsProps {
  slot: string;
  view: string;
  fullPath: string;
}

const ShowTabs: React.FC<ShowTabsProps> = ({ slot, view, fullPath }) => {
  const extensions = useAssignedExtensionIds(slot);
  const defaultExtension = extensions[0];
  const state = extensionStore.getState();

  useEffect(() => {
    if (!view && defaultExtension) {
      const state = extensionStore.getState();
      const extension = state.extensions[defaultExtension];
      navigate({
        to: `${fullPath}/${extension.meta.view}`,
      });
    }
  }, [view, defaultExtension, fullPath]);

  return (
    <ul>
      {view &&
        extensions.map((id) => {
          const extension = state.extensions[id];
          return (
            <li key={id}>
              <div className={`${extension.meta.view === view ? 'selected' : 'unselected'}`}>
                <ConfigurableLink to={`${fullPath}/${extension.meta.view}`}>
                  <button className="omrs-unstyled">{getTitle(extension)}</button>
                </ConfigurableLink>
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export interface TabbedViewProps {
  name: string;
  slot: string;
  patientUuid: string;
  patient: fhir.Patient;
  tab: string;
  layout: DashboardTabConfig;
}

const TabbedView: React.FC<TabbedViewProps> = ({ name, slot, patient, patientUuid, tab }) => {
  const { url } = useRouteMatch(basePath);
  const fullPath = `${window.spaBase}${url}/${name}`;
  const state = React.useMemo(
    () => ({
      basePath: url,
      fullPath,
      patientUuid,
      patient,
      view: tab,
    }),
    [patientUuid, patient, tab, fullPath, url],
  );

  return (
    <>
      <nav className={styles.summariesnav}>
        <ShowTabs slot={slot} view={tab} fullPath={fullPath} />
      </nav>
      <ExtensionSlot
        className={styles.routesContainer}
        extensionSlotName={slot}
        state={state}
        select={(extensions) => extensions.filter((ext) => ext.meta.view === tab)}
      />
    </>
  );
};

function getTitle(ext: ExtensionRegistration) {
  const title = ext?.meta?.title;
  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }
  return ext.name;
}

export default TabbedView;
