import "@testing-library/jest-dom/extend-expect";
import React from "react";
import Widget from "./widget.component";
import { render, waitForElement, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

describe(`<Widget />`, () => {
  const originalError = console.error;

  let testWidgetConfig = {
    name: "test"
  };

  afterAll(() => {
    console.error = originalError;
  });

  afterEach(() => {
    cleanup();
  });

  it(`should render widget dynamically using config`, async done => {
    const { queryByText } = render(
      <BrowserRouter>
        <Widget widgetConfig={testWidgetConfig} />
      </BrowserRouter>
    );

    const element = await waitForElement(() => queryByText("Test Widget"));
    expect(element).not.toBeNull();
    done();
  });

  it(`should render "Module failed to load" if the module is not found`, async done => {
    const { queryByText } = render(
      <BrowserRouter>
        <Widget widgetConfig={{ name: "test" }} />
      </BrowserRouter>
    );

    const element = await waitForElement(() =>
      queryByText(" failed to load", { exact: false })
    );
    expect(element).not.toBeNull();
    done();
  });

  it(`should render "[Widget] does not exist" if the widget is not found`, async done => {
    const { queryByText } = render(
      <BrowserRouter>
        <Widget
          widgetConfig={{
            name: "non-existing-widget"
          }}
        />
      </BrowserRouter>
    );

    const element = await waitForElement(() =>
      queryByText(" does not exist", { exact: false })
    );
    expect(element).not.toBeNull();
    done();
  });

  it(`should render "no module provided" if the no esModule property is present`, async done => {
    const { queryByText } = render(
      <BrowserRouter>
        <Widget
          widgetConfig={{
            name: "non-existing-widget"
          }}
        />
      </BrowserRouter>
    );

    const element = await waitForElement(() =>
      queryByText("no module provided", { exact: false })
    );
    expect(element).not.toBeNull();
    done();
  });

  it(`should get the SingleSpaContext`, async done => {
    const { queryByText, debug } = render(
      <BrowserRouter>
        <Widget
          widgetConfig={{
            name: "test"
          }}
        />
      </BrowserRouter>
    );

    const element = await waitForElement(() => queryByText("Test Widget"));
    expect(element).not.toBeNull();

    done();
  });
});
