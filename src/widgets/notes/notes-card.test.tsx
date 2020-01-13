import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockPatientEncounters } from "../../../__mocks__/encounters.mock";
import { getEncounters } from "./encounter.resource";
import NotesCard from "./notes-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import { formatNotesDate, getAuthorName } from "./notes-helper";

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
      const secondRow = tbody.children[2];
      expect(firstRow.children[0].textContent).toBe("09-Nov-2019 06:16 AM");
      expect(firstRow.children[1].textContent).toContain("Vitals");
      expect(firstRow.children[1].children[0].textContent).toBe(
        "Outpatient Clinic"
      );
      expect(firstRow.children[2].textContent).toBe("DAEMON");
      expect(secondRow.children[2].textContent).toBe(
        "SUPER USER(IDENTIFIER:ADMIN)"
      );
    });
  });
  it("renders  Encounter if not changed with original provider", () => {
    const mockNote = {
      participant: [
        {
          individual: {
            reference: "Practitioner/f9badd80-ab76-11e2-9e96-0800200c9a66",
            display: "Super User(Identifier:ADMIN)"
          }
        }
      ]
    };
    expect(getAuthorName(mockNote)).toBe(`SUPER USER(IDENTIFIER:ADMIN)`);
  });
  it("renders changed Encounter as with new provider", () => {
    const mocknote = {
      extension: [
        {
          url: "dateChanged",
          valueDateTime: "2017-01-18T09:02:37+00:00"
        },
        { url: "changedBy", valueString: "daemon" },
        {
          url: "formUuid",
          valueString: "c75f120a-04ec-11e3-8780-2b40bef9a44b"
        }
      ]
    };
    expect(getAuthorName(mocknote)).toBe(`DAEMON`);
  });
  it("renders dates according to designs", () => {
    const today = new Date();
    const sometimeLastYear = `${today.getFullYear() - 1}-11-13T09:32:14`;
    const sometimeThisYear = `${today.getFullYear()}-04-26T06:49:00`;
    expect(formatNotesDate(sometimeLastYear)).toBe(
      `13-Nov-${today.getFullYear() - 1} 09:32 AM`
    );
    expect(formatNotesDate(sometimeThisYear)).toBe(`26-Apr 06:49 AM`);

    /*
    expect(formatNotesDate(today.toString())).toBe(
      `Today   ${get12Hour(today.getHours())}:${zeroBase(today.getMinutes())} ${
        today.getHours() < 12 ? "A" : "P"
      }M`
    );
*/

    function zeroBase(num) {
      return num < 10 ? `0${num}` : num;
    }
    function get12Hour(hour) {
      return hour > 12 ? zeroBase(hour - 12) : zeroBase(hour);
    }
  });
});
