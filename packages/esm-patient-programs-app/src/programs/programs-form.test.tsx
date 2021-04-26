import React from "react";
import dayjs from "dayjs";
import ProgramsForm, { ProgramMatchProps } from "./programs-form.component";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  match,
  useHistory,
  useRouteMatch,
  BrowserRouter,
} from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import {
  createProgramEnrollment,
  fetchPrograms,
  fetchEnrolledPrograms,
  fetchLocations,
  getPatientProgramByUuid,
  getSession,
  updateProgramEnrollment,
} from "./programs.resource";
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse,
  mockLocationsResponse,
  mockOncProgramResponse,
} from "../../__mocks__/programs.mock";
import { mockSessionDataResponse } from "../../__mocks__/session.mock";

const mockCreateProgramEnrollment = createProgramEnrollment as jest.Mock;
const mockFetchLocations = fetchLocations as jest.Mock;
const mockFetchCarePrograms = fetchPrograms as jest.Mock;
const mockFetchEnrolledPrograms = fetchEnrolledPrograms as jest.Mock;
const mockGetProgramByUuid = getPatientProgramByUuid as jest.Mock;
const mockGetSession = getSession as jest.Mock;
const mockUseRouteMatch = useRouteMatch as jest.Mock;
const mockUseHistory = useHistory as jest.Mock;
const mockUpdateProgramEnrollment = updateProgramEnrollment as jest.Mock;
let testMatch: match<ProgramMatchProps>;

const renderProgramsForm = () =>
  render(
    <BrowserRouter>
      <ProgramsForm match={testMatch} />
    </BrowserRouter>
  );

jest.mock("./programs.resource", () => ({
  createProgramEnrollment: jest.fn(),
  fetchEnrolledPrograms: jest.fn(),
  fetchPrograms: jest.fn(),
  fetchLocations: jest.fn(),
  getPatientProgramByUuid: jest.fn(),
  getSession: jest.fn(),
  saveProgramEnrollment: jest.fn(),
  updateProgramEnrollment: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
  useRouteMatch: jest.fn(),
}));

const renderDate = (time: string) => dayjs(time).format("YYYY-MM-DD");

describe("<ProgramsForm />", () => {
  beforeEach(() => {
    mockUseRouteMatch.mockReset;
    mockFetchLocations.mockReset;
    mockFetchCarePrograms.mockReset;
    mockFetchEnrolledPrograms.mockReset;
    mockGetSession.mockReset;
    mockGetProgramByUuid.mockReset;
    mockUseHistory.mockReset;

    mockGetSession.mockReturnValue(Promise.resolve(mockSessionDataResponse));
    mockFetchCarePrograms.mockReturnValue(of(mockCareProgramsResponse));
    mockFetchLocations.mockReturnValue(of(mockLocationsResponse));
    mockGetProgramByUuid.mockReturnValue(of(mockOncProgramResponse));

    testMatch = { params: {}, isExact: false, path: "/", url: "/" };
  });

  afterEach(() => jest.restoreAllMocks());

  it("renders the add program form with all the appropriate fields and values", async () => {
    mockUseRouteMatch.mockReturnValue(testMatch);
    mockFetchEnrolledPrograms.mockReturnValue(of(mockEnrolledProgramsResponse));
    mockCreateProgramEnrollment.mockReturnValue(
      of({ status: 201, statusText: "Created" })
    );
    mockUseHistory.mockReturnValue({
      push: jest.fn(),
    });

    renderProgramsForm();

    await screen.findByRole("heading", { name: "Add a new program" });
    expect(screen.getByText("Add a new program")).toBeInTheDocument();
    expect(screen.getByLabelText("Program")).toBeInTheDocument();
    expect(screen.getByText("Choose a program:")).toBeInTheDocument();
    expect(
      screen.getByText("Oncology Screening and Diagnosis").textContent
    ).toBeTruthy();
    expect(
      screen.getByText("HIV Differentiated Care").textContent
    ).toBeTruthy();
    expect(screen.getByLabelText("Date enrolled")).toBeInTheDocument();
    expect(screen.getByLabelText("Date completed")).toBeInTheDocument();
    expect(screen.getByLabelText("Enrollment location")).toBeInTheDocument();
    expect(screen.getByText("Choose a location:")).toBeInTheDocument();
    expect(screen.getByText("Amani Hospital")).toBeInTheDocument();
    expect(screen.getByText("Inpatient Ward")).toBeInTheDocument();
    expect(screen.getByText("Isolation Ward")).toBeInTheDocument();
    expect(screen.getByText("Laboratory")).toBeInTheDocument();
    expect(screen.getByText("Mosoriot Pharmacy")).toBeInTheDocument();
    expect(
      screen.getByText("Mosoriot Subcounty Hospital").textContent
    ).toBeTruthy();
    expect(screen.getByText("MTRH")).toBeInTheDocument();
    expect(screen.getByText("MTRH Module 4")).toBeInTheDocument();
    expect(screen.getByText("Outpatient Clinic")).toBeInTheDocument();
    expect(screen.getByText("Pharmacy")).toBeInTheDocument();
    expect(screen.getByText("Registration Desk")).toBeInTheDocument();
    expect(screen.getByText("Unknown Location")).toBeInTheDocument();
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
    const enrollBtn = screen.getByRole("button", { name: "Enroll" });
    expect(enrollBtn).toBeInTheDocument();
    expect(enrollBtn).toBeDisabled();

    // Select Oncology screening and diagnosis program
    const oncologyScreeningProgramUuid = "11b129ca-a5e7-4025-84bf-b92a173e20de";
    const chooseProgramInput = screen.getAllByRole("combobox", { name: "" })[0];
    fireEvent.change(chooseProgramInput, {
      target: { value: oncologyScreeningProgramUuid },
    });
    await screen.findByDisplayValue("Oncology Screening and Diagnosis");

    // Select enrollment date
    const enrollmentDateInput = screen.getByLabelText("Date enrolled");
    fireEvent.change(enrollmentDateInput, { target: { value: "2020-05-05" } });
    await screen.findByDisplayValue(renderDate("2020-05-05"));

    // Select enrollment location
    const inpatientWardUuid = "b1a8b05e-3542-4037-bbd3-998ee9c40574";
    const chooseLocationInput = screen.getAllByRole("combobox", {
      name: "",
    })[1];
    fireEvent.change(chooseLocationInput, {
      target: { value: inpatientWardUuid },
    });
    await screen.findByDisplayValue("Inpatient Ward");

    fireEvent.click(enrollBtn);

    expect(mockCreateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockCreateProgramEnrollment).toHaveBeenCalledWith(
      {
        dateCompleted: null,
        dateEnrolled: "2020-05-05",
        location: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
        patient: "8673ee4f-e2ab-4077-ba55-4980f408773e",
        program: "11b129ca-a5e7-4025-84bf-b92a173e20de",
      },
      new AbortController()
    );

    // Should navigate away after successful POST
    expect(mockUseHistory).toHaveBeenCalled();

    window.confirm = jest.fn(() => true);

    // clicking Cancel prompts user for confirmation
    fireEvent.click(cancelBtn);

    jest.spyOn(window, "confirm").mockImplementation(() => true);

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(
      "There is ongoing work, are you sure you want to close this tab?"
    );
  });

  it("renders the edit program form when the edit button is clicked on an existing program", async () => {
    testMatch = {
      params: {
        program: "Oncology Screening and Diagnosis",
        programUuid: "46bd14b8-2357-42a2-8e16-262e8f0057d7",
        enrollmentDate: "2020-01-25T00:00:00.000+0000",
        completionDate: "2020-04-14T00:00:00.000+0000",
        locationUuid: "58c57d25-8d39-41ab-8422-108a0c277d98",
      },
      isExact: false,
      path: "/",
      url: "/",
    };
    mockUseRouteMatch.mockReturnValue(testMatch);
    mockUpdateProgramEnrollment.mockReturnValue(
      of({ status: 200, statusText: "OK" })
    );

    renderProgramsForm();

    await screen.findByRole("heading", { name: "Edit program" });
    expect(screen.getByText("Edit program")).toBeInTheDocument();
    expect(screen.getByLabelText("Program")).toBeInTheDocument();
    expect(
      screen.getByText("Oncology Screening and Diagnosis")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Date enrolled")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(renderDate(testMatch.params.enrollmentDate))
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Date completed")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(renderDate(testMatch.params.completionDate))
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Enrollment location")).toBeInTheDocument();
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
    const saveBtn = screen.getByRole("button", { name: "Save" });
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();

    // unenroll from program
    const completionDateInput = screen.getByLabelText("Date completed");
    fireEvent.change(completionDateInput, { target: { value: "2020-06-01" } });

    await screen.findByDisplayValue(renderDate("2020-06-01"));

    fireEvent.click(saveBtn);

    expect(mockUpdateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockUpdateProgramEnrollment).toHaveBeenCalledWith(
      {
        dateCompleted: "2020-06-01",
        dateEnrolled: "2020-01-25T00:00:00.000+0000",
        location: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
        program: "46bd14b8-2357-42a2-8e16-262e8f0057d7",
      },
      new AbortController()
    );

    // clicking Cancel prompts user for confirmation
    fireEvent.click(cancelBtn);

    jest.spyOn(window, "confirm").mockImplementation(() => true);

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(
      "There is ongoing work, are you sure you want to close this tab?"
    );
  });

  it("displays an error when an invalid enrollment date is selected", async () => {
    mockUseRouteMatch.mockReturnValue(testMatch);

    mockFetchEnrolledPrograms.mockReturnValue(of(mockEnrolledProgramsResponse));

    renderProgramsForm();

    const enrollmentDateInput = await screen.findByLabelText("Date enrolled");
    expect(enrollmentDateInput).toBeInTheDocument();

    fireEvent.change(enrollmentDateInput, { target: { value: "2030-05-05" } });

    expect(enrollmentDateInput).toBeInvalid();
    await screen.findByText(
      "Please enter a date that is either on or before today."
    );
    expect(screen.getAllByRole("button")[1]).toBeDisabled();
  });
});
