import React from "react";
import VisitButton from "./visit-button.component";
import { render, fireEvent, screen } from "@testing-library/react";
import {
  openmrsObservableFetch,
  newWorkspaceItem,
} from "@openmrs/esm-framework";
import { of } from "rxjs/internal/observable/of";
import {
  mockPatientNoVisitsResponse,
  mockPatientCurrentVisitsResponse,
} from "../../../../__mocks__/patient-visits.mock";

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockNewWorkspaceItem = newWorkspaceItem as jest.Mock;
const mockNewModalItem = jest.fn();

mockOpenmrsObservableFetch.mockImplementation(jest.fn());
mockNewWorkspaceItem.mockImplementation(jest.fn());

describe("Visit Button Component", () => {
  afterEach(() => {
    mockOpenmrsObservableFetch.mockReset;

    mockNewModalItem.mockReset;
    mockNewWorkspaceItem.mockReset;
  });

  beforeEach(() => {
    mockNewModalItem.mockImplementation(() => {});
    mockNewWorkspaceItem.mockImplementation(() => {});
  });

  function setUpMockPatientVisitResponse(mockData: any) {
    mockOpenmrsObservableFetch.mockImplementationOnce(
      (url: string, config: { method: string; body: any }) => {
        if (url.indexOf("/visit?patient=") >= 0) {
          return of(mockData);
        }
        return {};
      }
    );
  }

  it("should show Start Visit View when no visits", () => {
    setUpMockPatientVisitResponse(mockPatientNoVisitsResponse);
    render(<VisitButton newModalItem={mockNewModalItem} />);
    expect(
      screen.getByRole("button", { name: /Start visit/ })
    ).toBeInTheDocument();
  });

  it("should show Visit dashboard on Start button click", async () => {
    setUpMockPatientVisitResponse(mockPatientNoVisitsResponse);
    const wrapper = render(<VisitButton newModalItem={mockNewModalItem} />);
    const startButton = await screen.findByText("Start visit");
    fireEvent.click(startButton);
    expect(mockNewWorkspaceItem).toHaveBeenCalledTimes(1);
  });

  it("should show End Visit view When Current date Visit is Selected", async () => {
    setUpMockPatientVisitResponse(mockPatientCurrentVisitsResponse);
    const wrapper = render(<VisitButton newModalItem={mockNewModalItem} />);
    expect(wrapper.queryByTestId("end-visit")).toBeInTheDocument();
    expect(wrapper.queryByTestId("start-visit")).not.toBeInTheDocument();
  });

  it("should show End Visit prompt on End button click", async () => {
    setUpMockPatientVisitResponse(mockPatientCurrentVisitsResponse);
    const wrapper = render(<VisitButton newModalItem={mockNewModalItem} />);
    const endButton = await screen.findByText("End");
    fireEvent.click(endButton);
    expect(mockNewModalItem).toHaveBeenCalledTimes(1);
  });
});
