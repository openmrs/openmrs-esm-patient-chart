import React from "react";
import styles from "./sidebar.component.css";
import { newWorkspaceItem } from "../workspace/workspace.resource";

export default function Sidebar(props: any) {
  const sidebarItems = [
    { name: "A", onclick: () => newWorkspaceItem("allergy") },
    { name: "V", onclick: () => newWorkspaceItem("vitals") },
    { name: "F", onclick: () => newWorkspaceItem("forms") }
  ];
  return (
    <div className={styles.sidebar}>
      <ul className={styles.nav}>
        {sidebarItems.map((item, i) => (
          <li key={i} className={styles.navItem}>
            <button
              className="omrs-unstyled"
              onClick={item.onclick}
              style={{ padding: "1rem", width: "100%" }}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
