import React from "react";
import Forms from "./forms.component";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/react";
import { navigate } from "@openmrs/esm-framework";
import { fetchAllForms, fetchPatientEncounters } from "./forms.resource";
import { of } from "rxjs";
import { mockForms, mockPatientEncounters } from "../../__mocks__/forms.mock";

const mockNavigate = navigate as jest.Mock;
const mockFetchAllForms = fetchAllForms as jest.Mock;
const mockFetchPatientEncounters = fetchPatientEncounters as jest.Mock;

jest.mock("./forms.resource", () => ({
  fetchAllForms: jest.fn(),
  fetchPatientEncounters: jest.fn(),
}));

describe("<FormsComponent>", () => {
  const renderEmptyForm = () => {
    mockFetchPatientEncounters.mockReturnValue(of([]));
    mockFetchAllForms.mockReturnValue(of([]));
    render(<Forms />);
  };
  const renderCompleteForm = () => {
    mockFetchPatientEncounters.mockReturnValue(of(mockPatientEncounters));
    mockFetchAllForms.mockReturnValue(of(mockForms));
    render(<Forms />);
  };

  afterEach(() => {
    mockFetchPatientEncounters.mockReset();
    mockFetchAllForms.mockReset();
    cleanup();
  });

  it("should display empty state when no forms are available", async () => {
    renderEmptyForm();
    expect(
      screen.getByText(/There are no Forms to display for this patient/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Record forms/i)).toBeInTheDocument();
    const recordFormLink = screen.getByText(/Record forms/i);
    userEvent.click(recordFormLink);
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/formbuilder/#/forms" });
  });

  it("should display all the available forms", async () => {
    renderCompleteForm();
    const searchInput = screen.getByPlaceholderText(/Search for a form/i);
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals v1.0/i)).toBeInTheDocument();
  });

  it("should display the correct view when content switcher is clicked", () => {
    renderCompleteForm();
    const allFormsButton = screen.getByRole("tab", { name: /All/i });
    userEvent.click(allFormsButton);
    expect(allFormsButton).toHaveAttribute("aria-selected", "true");
    const completedFormsButton = screen.getByRole("tab", {
      name: /Completed/i,
    });
    userEvent.click(completedFormsButton);
    expect(completedFormsButton).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
  });
});
