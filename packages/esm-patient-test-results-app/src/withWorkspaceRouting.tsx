import { OpenmrsReactComponentProps } from "@openmrs/esm-framework";
import * as React from "react";
import { MemoryRouter, Route, useParams } from "react-router-dom";

export default function withWorkspaceRouting<T, K extends Record<string, any>>(
  WrappedComponent: React.FC<T & K>
): React.FC<T & OpenmrsReactComponentProps> {
  const WrappedWithParams = (props) => {
    const params = useParams<K>();
    return <WrappedComponent {...props} {...params} />;
  };

  return (props) => {
    return (
      <MemoryRouter
        initialEntries={[props._extensionContext?.actualExtensionSlotName]}
      >
        <Route path={props._extensionContext?.attachedExtensionSlotName}>
          <WrappedWithParams {...props} />
        </Route>
      </MemoryRouter>
    );
  };
}
