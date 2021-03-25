import React from "react";
import styles from "./tabbed-view.css";
import {
  ConfigurableLink,
  ExtensionSlot,
  useExtensionStore,
} from "@openmrs/esm-framework";
import { useRouteMatch } from "react-router-dom";
import { DashboardTabConfig } from "../config-schemas";
import { useUrlData } from "../useUrlData";

function ShowTabs({
  slot,
  view,
  fullPath,
}: {
  slot: string;
  view: string;
  fullPath: string;
}) {
  const store = useExtensionStore();
  const extensions = React.useMemo(() => {
    const ids = store.slots[slot].attachedIds;
    return ids.map((id) => store.extensions[id]);
  }, [store]);

  return (
    <ul>
      {extensions.map((ext) => (
        <li key={ext.name}>
          <div
            className={`${ext.meta.view === view ? "selected" : "unselected"}`}
          >
            <ConfigurableLink to={`${fullPath}/${ext.meta.view}`}>
              <button className="omrs-unstyled">{ext.meta.title}</button>
            </ConfigurableLink>
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface TabbedViewProps {
  name: string;
  slot: string;
  layout: DashboardTabConfig;
}

interface RouteParams {
  subview: string;
}

export default function TabbedView({ name, slot }: TabbedViewProps) {
  const urlData = useUrlData();
  const { params } = useRouteMatch<RouteParams>();
  const fullPath = `${urlData.basePath}/${name}`;
  const state = {
    ...urlData,
    fullPath,
    view: params.subview,
  };

  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ShowTabs slot={slot} view={params.subview} fullPath={fullPath} />
      </nav>
      <div className={styles.routesContainer}>
        <ExtensionSlot extensionSlotName={slot} state={state} />
      </div>
    </>
  );
}
