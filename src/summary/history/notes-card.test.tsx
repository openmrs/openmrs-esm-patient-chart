import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait, act } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockPatientEncounters } from "../../../__mocks__/encounters.mock";
import { getEncounters } from "./encounter.resource";
import NotesCard from "./notes-card.component";
const mockFetchPatientEncounters = getEncounters as jest.Mock;

jest.mock("./encounter.resource", () => ({
  getEncounters: jest.fn().mockResolvedValue({
    data: {}
  })
}));

describe("<NotesCard/>", () => {
  let patient: fhir.Patient, match;
  let wrapper;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <NotesCard currentPatient={patient} match={match}></NotesCard>
      </BrowserRouter>
    );
  });

  it("displays see more on the footer", () => {
    const wrapper = render(
      <BrowserRouter>
        <NotesCard currentPatient={patient} match={match}></NotesCard>
      </BrowserRouter>
    );
    expect(wrapper.getByText("See all")).not.toBeNull();
  });

  it("displays notes correctly", async () => {
    mockFetchPatientEncounters.mockResolvedValue(mockPatientEncounters);
    const wrapper = render(
      <BrowserRouter>
        <NotesCard currentPatient={patient} match={match}></NotesCard>
      </BrowserRouter>
    );
    const tbody = wrapper.container.querySelector("tbody");
    await wait(() => {
      const firstRow = tbody.children[0];
      expect(firstRow.children[0].textContent).toBe("09-Nov 09:16 AM");
      expect(firstRow.children[1].textContent).toContain("Vitals");
      expect(firstRow.children[1].children[0].textContent).toBe(
        "Outpatient Clinic"
      );
      expect(firstRow.children[2].textContent).toBe("DAEMON");
    });
  });
});
