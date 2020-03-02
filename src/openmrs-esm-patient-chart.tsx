import "./set-public-path";
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
export { backendDependencies } from "./openmrs-backend-dependencies";
export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);
export {
  newWorkspaceItem,
  getNewWorkspaceItem
} from "./workspace/workspace.resource";
