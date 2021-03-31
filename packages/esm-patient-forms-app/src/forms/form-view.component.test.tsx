import React from "react";
import FormView from "./form-view.component";
import userEvent from "@testing-library/user-event";
import { screen, render } from "@testing-library/react";
import { mockForms } from "../../__mocks__/forms.mock";
import { mockPatient } from "../../__mocks__/patient.mock";
import { switchTo, getStartedVisit } from "@openmrs/esm-framework";
import { mockCurrentVisit } from "../../__mocks__/visits.mock";

const mockSwitchTo = switchTo as jest.Mock;

jest.mock("lodash-es/debounce", () => jest.fn(fn => fn));

describe("<FormViewComponent/>", () => {
  beforeEach(() => {
    getStartedVisit.next(mockCurrentVisit);
    render(
      <FormView
        forms={mockForms}
        patientUuid={mockPatient.id}
        encounterUuid={"5859f098-45d6-4c4e-9447-53dd4032d7d7"}
      />
    );
  });

  it("should be able to search for a form", async () => {
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search for a form/);
    userEvent.type(searchInput, "POC");
    expect(await screen.getByText(/1 match found/)).toBeInTheDocument();
  });

  it("should display not found message when searched form is not found", () => {
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search for a form/);
    userEvent.type(searchInput, "some weird form");
    expect(
      screen.getByText(/Sorry, no forms have been found/)
    ).toBeInTheDocument();
  });

  it("should open form-entry extension form when a form is clicked", () => {
    const pocVitals = screen.getByText(/POC Vitals/i);
    userEvent.click(pocVitals);
    expect(mockSwitchTo).toHaveBeenCalledWith(
      "workspace",
      "/patient/8673ee4f-e2ab-4077-ba55-4980f408773e/formentry",
      {
        encounterUuid: "5859f098-45d6-4c4e-9447-53dd4032d7d7",
        formUuid: "c51b0cbe-32d8-4ea5-81d2-8f3ade30c2de",
        title: "POC Vitals v1.0"
      }
    );
  });
});
