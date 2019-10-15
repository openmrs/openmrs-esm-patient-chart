import React from "react";
import DemographicsCard from "./demographics-card.component";
import { render, cleanup } from "@testing-library/react";
import { of, Observable } from "rxjs";
import { getCurrentPatient } from "@openmrs/esm-api";
import { BrowserRouter } from "react-router-dom";

const getPatientMock = (getCurrentPatient as unknown) as jest.Mock<
  Observable<fhir.Patient>
>;

jest.mock("@openmrs/esm-api", () => ({
  getCurrentPatient: jest.fn()
}));

describe("<DemographicsCard>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = {
      resourceType: "Patient",
      id: "8673ee4f-e2ab-4077-ba55-4980f408773e",
      extension: [
        {
          url:
            "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
          valueDateTime: "2017-01-18T09:42:40+00:00"
        },
        {
          url:
            "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
          valueString: "daemon"
        }
      ],
      identifier: [
        {
          id: "1f0ad7a1-430f-4397-b571-59ea654a52db",
          use: "usual",
          system: "OpenMRS ID",
          value: "100GEJ"
        }
      ],
      active: true,
      name: [
        {
          id: "efdb246f-4142-4c12-a27a-9be60b9592e9",
          use: "usual",
          family: "Wilson",
          given: ["John"]
        }
      ],
      gender: "male",
      birthDate: "1972-04-04",
      deceasedBoolean: false,
      address: [
        {
          id: "0c244eae-85c8-4cc9-b168-96b51f864e77",
          use: "home",
          line: ["Address10351"],
          city: "City0351",
          state: "State0351tested",
          postalCode: "60351",
          country: "Country0351"
        }
      ]
    };

    match = { params: {}, isExact: false, path: "/", url: "/" };

    getPatientMock.mockReset();
  });

  it("renders the correct age for a 55 year old", () => {
    patient.birthDate = createBirthdayYearsAgo(55);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("55 yr");
  });

  it("renders the correct age for a 55 year old who had their birthday recently", () => {
    patient.birthDate = createBirthdayYearsAgo(55, 4);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("55 yr");
  });

  it("renders the correct age for a 18 year old", () => {
    patient.birthDate = createBirthdayYearsAgo(18);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("18 yr");
  });

  it("renders the correct age for a 17 year old who had their birthday three months ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 3);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 3 mo");
  });

  it("renders the correct age for a 17 year old who had their birthday three months and one day ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 3, 1);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 3 mo");
  });

  it("renders the correct age for a 17 year old who had their birthday almost three months ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 2, 27);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 2 mo");
  });

  it("renders the correct age for a 16 week old baby", () => {
    patient.birthDate = createBirthdayWeeksAgo(16);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("16 week");
  });

  it("renders the correct age for a 16 week and 1 day old baby", () => {
    patient.birthDate = createBirthdayWeeksAgo(16, 1);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("16 wk 1 d");
  });

  it("renders the correct age for a baby born in the last month", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 15);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("15 day");
  });

  it("renders the correct age for a baby born today", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 0);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("Today");
  });

  it("renders the correct age for a baby born two days ago", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 2);
    getPatientMock.mockReturnValue(of(patient));
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("2 day");
  });
});

function createBirthdayYearsAgo(years, months = 0, days = 0): string {
  const currentDate = new Date();
  const birthdayAgoDate = new Date(
    currentDate.getUTCFullYear() - years,
    currentDate.getUTCMonth() - months,
    currentDate.getUTCDate() - days
  );
  const fullString = birthdayAgoDate.toISOString();
  return fullString.slice(0, fullString.indexOf("T"));
}

function createBirthdayWeeksAgo(weeks, days = 0) {
  const today = new Date();
  const weeksAgo = weeks * 604800000;
  const daysAgo = days * 86400000;
  const birthDate = new Date(today.getTime() - weeksAgo - daysAgo);
  const birthDateISO = birthDate.toISOString();
  return birthDateISO.slice(0, birthDateISO.indexOf("T"));
}
