import db from "./dashboard.meta";
import {
  createDashboardLink,
  DashboardConfig,
} from "@openmrs/esm-patient-common-lib";

export default createDashboardLink(db as DashboardConfig);
