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

  it(`should render widget dynamically using config`, async done => {
    const { queryByText } = render(<Widget widgetConfig={testWidgetConfig} />);

    const element = await waitForElement(() => queryByText("Test Widget"));
    expect(element).not.toBeNull();
    done();
  });

  it(`should render "Module failed to load" if the module is not found`, async done => {
    const { queryByText } = render(
      <Widget widgetConfig={{ name: "test", esModule: "does-not-exist" }} />
    );

    const element = await waitForElement(() =>
      queryByText(" failed to load", { exact: false })
    );
    expect(element).not.toBeNull();
    done();
  });

  it(`should render "[Widget] does not exist" if the widget is not found`, async done => {
    const { queryByText } = render(
      <Widget
        widgetConfig={{
          name: "non-existing-widget",
          esModule: "@openmrs/esm-patient-chart-widgets"
        }}
      />
    );

    const element = await waitForElement(() =>
      queryByText(" does not exist", { exact: false })
    );
    expect(element).not.toBeNull();
    done();
  });
});
