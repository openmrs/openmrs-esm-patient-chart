import React from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";

export interface PatientChartNavProps {
  basePath: string;
}

export default function Root(props: PatientChartNavProps) {
  const path = `${props.basePath}/vitals`;
  return (
    <ConfigurableLink to={path} className="bx--side-nav__link">
      Vitals
    </ConfigurableLink>
  );
}
