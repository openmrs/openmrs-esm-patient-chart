import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";

function Root(props) {
  return <h1>Patient Chart is working</h1>;
}

export default openmrsRootDecorator({ featureName: "patient-chart" })(Root);
