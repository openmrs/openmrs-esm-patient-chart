import "./set-public-path";
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import {
  singleSpaPropsSubject,
  SingleSpaProps
} from "./single-spa/single-spa-props";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root
});

export const bootstrap = (props: SingleSpaProps) => {
  // Necessary to avoid propagating props from root component to inner components in order to get app props
  singleSpaPropsSubject.next(props);
  return lifecycles.bootstrap(props);
};
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
export { backendDependencies } from "./openmrs-backend-dependencies";
export {
  singleSpaPropsSubject,
  SingleSpaProps
} from "./single-spa/single-spa-props";
export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);
