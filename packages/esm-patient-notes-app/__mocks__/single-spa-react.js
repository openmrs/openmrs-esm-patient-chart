// In __mocks__/single-spa-react.js
//import context from "../src/view-components/widget/testHelpers";
const React = require("react");
//const context = require("../src/view-components/widget/testHelpers");

const SingleSpaContext = React.createContext({ mountParcel: () => jest.fn() });

//constexport default mock;
module.exports = {
  SingleSpaContext: SingleSpaContext
};
