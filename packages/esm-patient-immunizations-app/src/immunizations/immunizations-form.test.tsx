import React from "react";
import dayjs from "dayjs";
import ImmunizationsForm from "./immunizations-form.component";
import { BrowserRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { of } from "rxjs/internal/observable/of";
import {
  openmrsObservableFetch,
  getStartedVisit,
  VisitItem,
} from "@openmrs/esm-framework";
import { savePatientImmunization } from "./immunizations.resource";
import { mockSessionDataResponse } from "../../../../__mocks__/session.mock";
import { mockPatient } from "../../../../__mocks__/patient.mock";

const mockPatientId = mockPatient.id;
const mockSavePatientImmunization = savePatientImmunization as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
let testMatch: any = { params: {} };

const renderImmunizationsForm = () => {
  render(
    <BrowserRouter>
      <ImmunizationsForm match={testMatch} />
    </BrowserRouter>
  );
};

mockOpenmrsObservableFetch.mockImplementation(jest.fn());

jest.mock("./immunizations.resource", () => ({
  savePatientImmunization: jest.fn(),
}));

describe("<ImmunizationsForm />", () => {
  getStartedVisit.getValue = function () {
    const mockVisitItem: VisitItem = {
      visitData: { uuid: "visitUuid" } as any,
    } as any;
    return mockVisitItem;
  };

  mockOpenmrsObservableFetch.mockImplementation(() =>
    of(mockSessionDataResponse)
  );

  afterEach(mockSavePatientImmunization.mockReset);

  it("renders immunization form without dying", async () => {
    testMatch.params = {
      vaccineName: "Rotavirus",
    };

    renderImmunizationsForm();
  });

  it("displays the appropriate fields when adding a new immunization without sequence", async () => {
    testMatch.params = {
      vaccineName: "Rotavirus",
    };

    renderImmunizationsForm();

    await screen.findByText("Add Vaccine: Rotavirus");

    expect(screen.getByText("Add Vaccine: Rotavirus")).toBeInTheDocument();
    expect(screen.queryByText("Sequence")).toBeNull();
    expect(screen.getByText("Vaccination Date")).toBeInTheDocument();
    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
    expect(screen.getByText("Lot Number")).toBeInTheDocument();
    expect(screen.getByText("Manufacturer")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("displays the appropriate fields when adding a new immunization with sequence", async () => {
    testMatch.params = {
      vaccineName: "Rotavirus",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
    };

    renderImmunizationsForm();

    await screen.findByText("Add Vaccine: Rotavirus");
    expect(screen.getByText("Vaccination Date")).toBeInTheDocument();
    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
    expect(screen.getByText("Lot Number")).toBeInTheDocument();
    expect(screen.getByText("Sequence")).toBeInTheDocument();
    expect(screen.getByText("Manufacturer")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("displays the appropriate fields and values when editing an existing immunization without sequence", async () => {
    testMatch.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: "Organization/hl7",
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "12345",
    };

    renderImmunizationsForm();

    await screen.findByText("Edit Vaccine: Rotavirus");

    expect(screen.getByText("Edit Vaccine: Rotavirus")).toBeInTheDocument();
    expect(screen.getByLabelText("Vaccination Date")).toHaveDisplayValue(
      "2018-06-18"
    );
    expect(screen.getByLabelText("Expiration Date")).toHaveDisplayValue(
      "2018-12-15"
    );
    expect(screen.getByLabelText("Lot Number")).toHaveDisplayValue("12345");
    expect(screen.getByLabelText("Manufacturer")).toHaveDisplayValue(
      "Organization/hl7"
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("displays the appropriate fields and values when editing an existing immunization with sequence", async () => {
    testMatch.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: "Organization/hl7",
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "12345",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 },
    };

    renderImmunizationsForm();

    await screen.findByText("Edit Vaccine: Rotavirus");
    expect(screen.getByText("Edit Vaccine: Rotavirus")).toBeInTheDocument();

    expect(screen.getByLabelText("Vaccination Date")).toHaveDisplayValue(
      "2018-06-18"
    );
    expect(screen.getByLabelText("Expiration Date")).toHaveDisplayValue(
      "2018-12-15"
    );
    expect(screen.getByLabelText("Lot Number")).toHaveDisplayValue("12345");
    expect(screen.getByLabelText("Manufacturer")).toHaveDisplayValue(
      "Organization/hl7"
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should have save button disabled unless data entered", () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      vaccineName: "Rotavirus",
    };

    renderImmunizationsForm();

    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("should enable save button when mandatory fields are selected", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      vaccineName: "Rotavirus",
    };

    renderImmunizationsForm();

    await screen.findByLabelText("Vaccination Date");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    const vaccinationDate = screen.getByLabelText("Vaccination Date");
    fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("makes a call to create new immnunization without sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid",
    };

    renderImmunizationsForm();

    await screen.findByLabelText("Vaccination Date");

    const vaccinationDate = screen.getByLabelText("Vaccination Date");
    fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

    const vaccinationExpiration = screen.getByLabelText("Expiration Date");
    fireEvent.change(vaccinationExpiration, {
      target: { value: "2020-06-30" },
    });

    const lotNumber = screen.getByLabelText("Lot Number");
    fireEvent.change(lotNumber, { target: { value: "19876" } });

    const manufacturer = screen.getByLabelText("Manufacturer");
    fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

    fireEvent.submit(screen.getByTestId("immunization-form"));

    expect(mockSavePatientImmunization).toBeCalled();

    const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
    expectImmunization(
      firstArgument,
      undefined,
      "visitUuid",
      undefined,
      undefined,
      "19876"
    );

    const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
    expect(secondArgument).toBe(mockPatientId);

    const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
    expect(thirdArgument).toBeUndefined();
  });

  it("makes a call to create new immnunization with sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
    };

    renderImmunizationsForm();

    await screen.findByLabelText("Sequence");
    const sequence = screen.getByLabelText("Sequence");
    fireEvent.change(sequence, { target: { value: 2 } });

    const vaccinationDate = screen.getByLabelText("Vaccination Date");
    fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

    const vaccinationExpiration = screen.getByLabelText("Expiration Date");
    fireEvent.change(vaccinationExpiration, {
      target: { value: "2020-06-30" },
    });

    const lotNumber = screen.getByLabelText("Lot Number");
    fireEvent.change(lotNumber, { target: { value: "19876" } });

    const manufacturer = screen.getByLabelText("Manufacturer");
    fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

    fireEvent.submit(screen.getByTestId("immunization-form"));
    expect(mockSavePatientImmunization).toBeCalled();

    const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
    expectImmunization(
      firstArgument,
      undefined,
      "visitUuid",
      "4 Months",
      2,
      "19876"
    );

    const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
    expect(secondArgument).toBe(mockPatientId);

    const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
    expect(thirdArgument).toBeUndefined();
  });

  it("should have save button disabled unless data changed in edit mode", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: { display: "Organization/hl7" },
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "PT123F",
      sequence: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 },
    };

    renderImmunizationsForm();

    await screen.findByRole("button", { name: "Save" });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("makes a call to edit existing immnunization with sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    testMatch.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid",
      manufacturer: "XYTR4",
      expirationDate: "2020-06-30",
      vaccinationDate: "2020-06-15",
      lotNumber: "PT123F",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 },
    };

    renderImmunizationsForm();

    await screen.findByLabelText("Lot Number");
    const lotNumber = screen.getByLabelText("Lot Number");

    fireEvent.change(lotNumber, { target: { value: "12345" } });
    fireEvent.submit(screen.getByTestId("immunization-form"));

    expect(mockSavePatientImmunization).toBeCalled();

    const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
    expectImmunization(
      firstArgument,
      "b9c21a82-aed3-11ea-b3de-0242ac130004",
      "visitUuid",
      "2 Months",
      1,
      "12345"
    );

    const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
    expect(secondArgument).toBe(mockPatientId);

    const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
    expect(thirdArgument).toBe("b9c21a82-aed3-11ea-b3de-0242ac130004");
  });
});

function expectImmunization(
  immunizationParam,
  immunizationObsUuid,
  expectedEncounterUuid,
  expectedSeries,
  sequenceNumber,
  expectedLotNumber
) {
  expect(immunizationParam.resourceType).toBe("Immunization");
  expect(immunizationParam.id).toBe(immunizationObsUuid);
  expect(immunizationParam.vaccineCode.coding[0].display).toBe("Rotavirus");
  expect(immunizationParam.vaccineCode.coding[0].code).toBe("RotavirusUuid");
  expect(immunizationParam.patient.reference).toBe(`Patient/${mockPatientId}`);

  expect(immunizationParam.encounter).toBeTruthy();
  expect(immunizationParam.encounter.reference).toBe(
    `Encounter/${expectedEncounterUuid}`
  );

  expect(immunizationParam.location).toBeTruthy();
  expect(immunizationParam.location.reference).toBe(
    "Location/b1a8b05e-3542-4037-bbd3-998ee9c40574"
  );

  expect(immunizationParam.performer[0].actor).toBeTruthy();
  expect(immunizationParam.performer[0].actor.reference).toBe(
    "Practitioner/b1a8b05e-3542-4037-bbd3-998ee9c4057z"
  );

  expect(immunizationParam.manufacturer.display).toBe("XYTR4");
  expect(immunizationParam.lotNumber).toBe(expectedLotNumber);

  expect(immunizationParam.protocolApplied[0].series).toBe(expectedSeries);
  expect(immunizationParam.protocolApplied[0].doseNumberPositiveInt).toBe(
    sequenceNumber
  );
  expect(immunizationParam.occurrenceDateTime.toISOString()).toBe(
    dayjs("2020-06-15").toISOString()
  );
  expect(immunizationParam.expirationDate.toISOString()).toBe(
    dayjs("2020-06-30").toISOString()
  );
}
