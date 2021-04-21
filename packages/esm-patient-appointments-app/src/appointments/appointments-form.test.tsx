import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useHistory, BrowserRouter } from "react-router-dom";
import {
  mockAppointmentsServiceResponse,
  mockAppointmentsServiceFullResponse,
} from "../../__mocks__/appointments.mock";
import { mockSessionDataResponse } from "../../__mocks__/session.mock";
import AppointmentsForm from "./appointments-form.component";
import {
  createAppointment,
  getSession,
  getAppointmentService,
  getAppointmentServiceAll,
} from "./appointments.resource";

const mockUseHistory = useHistory as jest.Mock;
const mockCreateAppointment = createAppointment as jest.Mock;
const mockGetAppointmentService = getAppointmentService as jest.Mock;
const mockGetAppointmentServiceAll = getAppointmentServiceAll as jest.Mock;
const mockGetSession = getSession as jest.Mock;

jest.mock("./appointments.resource", () => ({
  createAppointment: jest.fn(),
  getAppointmentService: jest.fn(),
  getAppointmentServiceAll: jest.fn(),
}));

jest.mock("../vitals/vitals-biometrics.resource", () => ({
  getSession: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
}));

describe("<AppointmentsForm />", () => {
  beforeEach(() => {
    mockCreateAppointment.mockReset;
    mockGetAppointmentService.mockReset;
    mockGetAppointmentServiceAll.mockReset;
    mockUseHistory.mockReset;
  });

  afterEach(() => jest.restoreAllMocks());

  it("renders the appointments form with all the relevant fields and values", async () => {
    mockGetSession.mockReturnValue(Promise.resolve(mockSessionDataResponse));
    mockGetAppointmentServiceAll.mockReturnValue(
      Promise.resolve(mockAppointmentsServiceFullResponse)
    );
    mockGetAppointmentService.mockReturnValue(
      Promise.resolve(mockAppointmentsServiceResponse)
    );
    mockCreateAppointment.mockReturnValue(
      Promise.resolve({ status: 200, statusText: "ok" })
    );
    mockUseHistory.mockReturnValue({
      push: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AppointmentsForm />
      </BrowserRouter>
    );

    await screen.findByText(/schedule new appointment/i);
    expect(screen.getByLabelText("Service")).toBeInTheDocument();
    expect(screen.getByText("Select service")).toBeInTheDocument();
    expect(screen.getByText("Outpatient")).toBeInTheDocument();
    expect(screen.getByLabelText("Service type")).toBeInTheDocument();
    const appointmentDate = screen.getByLabelText("Date");
    const startTime = screen.getByLabelText("Start time");
    const endTime = screen.getByLabelText("End time");
    expect(appointmentDate).toBeInTheDocument();
    expect(startTime).toBeInTheDocument();
    expect(endTime).toBeInTheDocument();
    const walkInAppointmentCheck = screen.getByRole("checkbox", {
      name: "Walk-in appointment",
    });
    const commentBox = screen.getByRole("textbox", { name: "" });
    expect(walkInAppointmentCheck).toBeInTheDocument();
    expect(commentBox).toBeInTheDocument();
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    const saveBtn = screen.getByRole("button", { name: "Save" });
    expect(cancelBtn).toBeInTheDocument();
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();

    // Select Inpatient service
    const serviceSelector = screen.getAllByRole("combobox", { name: "" })[0];

    fireEvent.change(serviceSelector, {
      target: { value: "f1c1a452-d2de-4392-ac23-cd4a4f5e84aa" },
    });

    await screen.findByText("Inpatient");

    // Select Chemotherapy service
    const serviceTypeSelector = screen.getAllByRole("combobox", {
      name: "",
    })[1];

    fireEvent.change(serviceTypeSelector, {
      target: { value: "53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1" },
    });

    await screen.findByText("Chemotherapy");

    // Set appointment date
    fireEvent.change(appointmentDate, { target: { value: "2020-03-03" } });

    await screen.findByDisplayValue("2020-03-03");

    // Set start and end times
    fireEvent.change(startTime, { target: { value: "10:00" } });
    fireEvent.change(endTime, { target: { value: "10:15" } });

    await screen.findByDisplayValue("10:00");
    await screen.findByDisplayValue("10:15");

    // Set appointment type to Walk-in
    fireEvent.click(walkInAppointmentCheck);

    await screen.findByDisplayValue("WalkIn");

    // Add comment
    fireEvent.change(commentBox, {
      target: { value: "Testing out the Appointments form" },
    });

    await screen.findByDisplayValue("Testing out the Appointments form");

    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);

    expect(mockCreateAppointment).toHaveBeenCalledTimes(1);
    expect(mockCreateAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceTypeUuid: "53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1",
        serviceUuid: "f1c1a452-d2de-4392-ac23-cd4a4f5e84aa",
        appointmentKind: "WalkIn",
        comments: "Testing out the Appointments form",
        locationUuid: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
        patientUuid: "8673ee4f-e2ab-4077-ba55-4980f408773e",
        status: null,
        providerUuid: "b1a8b05e-3542-4037-bbd3-998ee9c4057z",
      }),
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
});
