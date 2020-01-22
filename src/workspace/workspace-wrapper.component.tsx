import React from "react";
import Workspace from "./workspace.component";
import { Breadcrumbs } from "../summary/breadcrumbs/breadcrumbs.component";
import styles from "./workspace-wrapper.component.css";

export default function WorkspaceWrapper(props: any) {
  const [showWorkspace, setShowWorkspace] = React.useState(false);
  return (
    <div
      style={{ ...props.style }}
      className={`${styles.workspace} ${
        showWorkspace ? styles.visible : styles.invisible
      }`}
    >
      <Breadcrumbs
        rootUrl={{ name: "Workspace", url: "/patient/:patientUuid/chart" }}
        routes={[]}
      />
      <Workspace showWorkspace={setShowWorkspace} />
    </div>
  );
}
