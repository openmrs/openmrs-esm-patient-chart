import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockPatientEncounters } from "../../../__mocks__/encounters.mock";
import { getEncounters } from "./encounter.resource";
import NotesCard from "./notes-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";

const mockFetchPatientEncounters = getEncounters as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./encounter.resource", () => ({
  getEncounters: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<NotesCard/>", () => {
  let match;
  afterEach(cleanup);

  beforeEach(() => {
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  beforeEach(mockFetchPatientEncounters.mockReset);
  beforeEach(mockUseCurrentPatient.mockReset);

  it("renders successfully", () => {
    mockFetchPatientEncounters.mockReturnValue(Promise.resolve({}));
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ]);
    render(
      <BrowserRouter>
        <NotesCard match={match} />
      </BrowserRouter>
    );
  });

  it("displays see more on the footer", async () => {
    mockFetchPatientEncounters.mockReturnValue(
      Promise.resolve(mockPatientEncounters)
    );
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ]);

    const wrapper = render(
      <BrowserRouter>
        <NotesCard match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper.getByText("See all")).not.toBeNull();
    });
  });

  it("displays notes correctly", async () => {
    mockFetchPatientEncounters.mockReturnValue(
      Promise.resolve(mockPatientEncounters)
    );
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ]);
    const wrapper = render(
      <BrowserRouter>
        <NotesCard match={match}></NotesCard>
      </BrowserRouter>
    );
    const tbody = wrapper.container.querySelector("tbody");
    await wait(() => {
      const firstRow = tbody.children[0];
      expect(firstRow.children[0].textContent).toBe("09-Nov 06:16 AM");
      expect(firstRow.children[1].textContent).toContain("Vitals");
      expect(firstRow.children[1].children[0].textContent).toBe(
        "Outpatient Clinic"
      );
      expect(firstRow.children[2].textContent).toBe("DAEMON");
    });
  });
});
