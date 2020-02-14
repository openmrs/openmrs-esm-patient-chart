import React from "react";
import styles from "./sidebar.component.css";
import { newWorkspaceItem } from "../workspace/workspace.resource";
import { AllergyForm } from "../widgets/allergies/allergy-form.component";
import Parcel from "single-spa-react";
import { VitalsForm } from "../widgets/vitals/vitals-form.component";
import { MedicationOrderBasket } from "../widgets/medications/medication-order-basket.component";
import { mountRootParcel } from "single-spa";

export default function Sidebar(props: any) {
  const sidebarItems = [
    {
      name: "A",
      onclick: () =>
        newWorkspaceItem({
          component: AllergyForm,
          name: "Allergy",
          props: { match: { params: {} } },
          inProgress: false,
          validations: (workspaceTabs: any[]) =>
            workspaceTabs.findIndex(tab => tab.component === AllergyForm)
        })
    },
    {
      name: "V",
      onclick: () =>
        newWorkspaceItem({
          component: VitalsForm,
          name: "Vitals",
          props: { match: { params: {} } },
          inProgress: false,
          validations: (workspaceTabs: any[]) =>
            workspaceTabs.findIndex(tab => tab.component === VitalsForm)
        })
    },
    {
      name: "F",
      onclick: () =>
        newWorkspaceItem({
          component: (
            <Parcel
              config={System.import("@ampath/esm-angular-form-entry")}
              mountParcel={mountRootParcel}
            />
          ),
          name: "Forms",
          props: { match: { params: {} } },
          inProgress: false
        })
    }
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
