import React, { useState } from "react";

export enum ActionMenuTypes {
  NOTIFICATIONS = "notifications",
  CART = "cart",
  DOCUMENTS = "documents",
}

export interface ActionMenuStateInterface {
  type: ActionMenuTypes;
}

export interface ActionMenuHookState {
  state: ActionMenuStateInterface;
  defaultState: Record<string, string>;
  setActionMenuState: Function;
}

const useActionMenuState = (): ActionMenuHookState => {
  const defaultState = { type: undefined };
  const [state, setActionMenuState] = useState(defaultState);

  return {
    state,
    setActionMenuState,
    defaultState,
  };
};

export default useActionMenuState;
