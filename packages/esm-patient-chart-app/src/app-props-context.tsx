import React from "react";

const defaultProps = {
  appProps: null
};

export const AppPropsContext = React.createContext(defaultProps);

// How motivation of this context: https://reactjs.org/docs/context.html
// Example of how to consume this context
// <AppPropsContext.Consumer>
//  {value => /* render something based on the context value */}
// </AppPropsContext.Consumer>
