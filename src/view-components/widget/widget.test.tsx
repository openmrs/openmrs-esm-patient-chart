import React from "react";
import { render, waitForElement, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Widget from "./widget.component";

declare var System;

describe(`<Widget />`, () => {
  const originalError = console.error;

  let testWidgetConfig = {
    esModule: "@openmrs/esm-patient-chart-widgets",
    name: "test"
  };

  beforeAll(() => {
    System.import = jest.fn().mockImplementation(module => {
      return module === "@openmrs/esm-patient-chart-widgets"
        ? Promise.resolve({ test: () => <div>Test Widget</div> })
        : Promise.reject({ reason: "module failed to load" });
    });
  });

  afterAll(() => {
    console.error = originalError;
  });

  afterEach(() => {
    cleanup();
  });

  it(`should render widget dynamically using config`, done => {
    const { queryByText } = render(<Widget widgetConfig={testWidgetConfig} />);

    waitForElement(() => queryByText("Test Widget")).then(() => {
      expect(queryByText("Test Widget")).not.toBeNull();
      done();
    });
  });

  it(`should render "Module failed to load" if the module is not found`, done => {
    const { queryByText } = render(
      <Widget widgetConfig={{ name: "test", esModule: "does-not-exist" }} />
    );

    waitForElement(() => queryByText(" failed to load", { exact: false })).then(
      () => {
        expect(queryByText("failed to load", { exact: false })).not.toBeNull();
        done();
      }
    );
  });

  it(`should render "[Widget] does not exist" if the widget is not found`, done => {
    const { queryByText } = render(
      <Widget
        widgetConfig={{
          name: "non-existing-widget",
          esModule: "@openmrs/esm-patient-chart-widgets"
        }}
      />
    );

    waitForElement(() => queryByText(" does not exist", { exact: false })).then(
      () => {
        expect(queryByText("does not exist", { exact: false })).not.toBeNull();
        done();
      }
    );
  });
});
