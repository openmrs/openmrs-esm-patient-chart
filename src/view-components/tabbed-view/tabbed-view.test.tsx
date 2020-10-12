import React from "react";
import { BrowserRouter, match, useRouteMatch } from "react-router-dom";
import TabbedView from "./tabbed-view.component";
import {
  render,
  screen,
  getByText,
  fireEvent,
  wait,
  findAllByRole,
  getAllByRole
} from "@testing-library/react";
import { useConfig } from "@openmrs/esm-config";
import {
  mockedTabbedViewConfig,
  mockConfig,
  mockDefaultPath
} from "../../../__mocks__/tabbed-view.mock";
import "@testing-library/jest-dom";

const mockUseConfig = useConfig as jest.Mock;
const mockUseRouteMatch = useRouteMatch as jest.Mock;

const mockMatch: match = {
  isExact: true,
  params: { subview: "overview" },
  path: "/patient/0b1b7481-704b-440f-a50f-3b7d0abac8c1/chart/results/:subview?",
  url: "/patient/0b1b7481-704b-440f-a50f-3b7d0abac8c1/chart/results/overview"
};

jest.mock("@openmrs/esm-config", () => ({
  useConfig: jest.fn()
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: jest.fn()
}));

describe("TabbedView", () => {
  beforeAll(() => {
    System.import = jest.fn().mockImplementation(module => {
      return module === "@openmrs/esm-patient-chart-widgets"
        ? Promise.resolve({ test: () => <div>Test Widget</div> })
        : Promise.reject({ reason: "module failed to load" });
    });
  });

  beforeEach(() => {
    mockUseConfig.mockReturnValue(mockedTabbedViewConfig);
    mockUseRouteMatch.mockReturnValue(mockMatch);
  });

  afterEach(() => {
    mockUseConfig.mockReset();
    mockUseRouteMatch.mockReset();
  });

  it("should render the tabs", () => {
    render(
      <BrowserRouter>
        <TabbedView config={mockConfig} defaultPath={mockDefaultPath} />
      </BrowserRouter>
    );
  });

  it("should select the overview tab by default", async () => {
    render(
      <BrowserRouter>
        <TabbedView config={mockConfig} defaultPath={mockDefaultPath} />
      </BrowserRouter>
    );
    const listItemArray = screen.getAllByRole("listitem");
    expect(listItemArray[0].firstChild).toHaveClass("selected");
    expect(listItemArray[1].firstChild).toHaveClass("unselected");
    expect(listItemArray[2].firstChild).toHaveClass("unselected");
  });

  it("should select the correct tab when tab label is clicked", async () => {
    render(
      <BrowserRouter>
        <TabbedView config={mockConfig} defaultPath={mockDefaultPath} />
      </BrowserRouter>
    );

    const vitalsButton = screen.getByText(/Vitals/);
    expect(screen.getAllByRole("listitem")[0].firstChild).toHaveClass(
      "selected"
    );
    fireEvent.click(vitalsButton);
    const listItemArray: Array<HTMLElement> = await screen.findAllByRole(
      "listitem"
    );
    expect(listItemArray[0].firstChild).toHaveClass("unselected");
    expect(listItemArray[1].firstChild).toHaveClass("selected");
    expect(listItemArray[2].firstChild).toHaveClass("unselected");
  });
});
