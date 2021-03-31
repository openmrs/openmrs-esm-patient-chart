import React from "react";
import ConditionRecord from "./condition-record.component";
import { of } from "rxjs/internal/observable/of";
import { BrowserRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockPatientConditionResult } from "../../../__mocks__/conditions.mock";
import { openWorkspaceTab } from "../shared-utils";
import { getConditionByUuid } from "./conditions.resource";
import { ConditionsForm } from "./conditions-form.component";

const mockGetConditionByUuid = getConditionByUuid as jest.Mock;
const mockOpenWorkspaceTab = openWorkspaceTab as jest.Mock;

jest.mock("./conditions.resource", () => ({
  getConditionByUuid: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));

describe("<ConditionRecord />", () => {
  const conditionUuid = "1e9160ee-8927-409c-b8f3-346c9736f8d7";
  let match = {
    params: {
      conditionUuid
    },
    isExact: true,
    url: "/",
    path: `/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart/conditions/details/${conditionUuid}`
  };

  beforeEach(() => {
    mockOpenWorkspaceTab.mockReset;
    mockGetConditionByUuid.mockReset;
  });

  it("displays a detailed summary of the selected condition", async () => {
    mockGetConditionByUuid.mockReturnValue(of(mockPatientConditionResult));

    render(
      <BrowserRouter>
        <ConditionRecord match={match} />
      </BrowserRouter>
    );

    await screen.findByText("Condition");
    expect(screen.getByText("Condition")).toBeInTheDocument();
    const editBtn = screen.getByRole("button", { name: "Edit" });
    expect(editBtn).toBeInTheDocument();
    expect(screen.getByText("Malaria, confirmed")).toBeInTheDocument();
    expect(screen.getByText("Onset date")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Nov-2019")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Last updated")).toBeInTheDocument();
    expect(screen.getByText("Last updated by")).toBeInTheDocument();
    expect(screen.getByText("Last updated location")).toBeInTheDocument();

    // Clicking "Edit" launches edit form in workspace tab
    fireEvent.click(editBtn);
    expect(mockOpenWorkspaceTab).toHaveBeenCalled();
    expect(mockOpenWorkspaceTab).toHaveBeenCalledWith(
      ConditionsForm,
      "Edit Condition",
      {
        conditionUuid,
        clinicalStatus: "active",
        conditionName: "Malaria, confirmed",
        onsetDateTime: "2019-11-04T00:00:00+00:00"
      }
    );
  });
});
