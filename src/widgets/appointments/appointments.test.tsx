import React from "react";
import { act } from "react-dom/test-utils";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
import AppointmentsOverview from "./appointments-overview.component";
import { BrowserRouter } from "react-router-dom";
import { useCurrentPatient } from "@openmrs/esm-api";
import { patient } from "../../../__mocks__/allergy.mock";
import { appointment } from "./appointments.mock";
import { getAppointments } from "./appointments.resource";
import dayjs from "dayjs";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockPatientAppointments = getAppointments as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

jest.mock("./appointments.resource", () => ({
  getAppointments: jest.fn()
}));

beforeEach(mockPatientAppointments.mockReset);
afterEach(cleanup);

describe("<AppointmentOverview/>", () => {
  let match = {};
  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPatientAppointments.mockResolvedValue(Promise.resolve(appointment));

    act(() => {
      render(
        <BrowserRouter>
          <AppointmentsOverview match={match} />
        </BrowserRouter>
      );
    });
    await wait(() => {
      expect(true).toEqual(true);
    });
  });

  it("renders the correct columns", async () => {
    let wrapper: any;

    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPatientAppointments.mockResolvedValue(Promise.resolve(appointment));

    act(() => {
      wrapper = render(
        <BrowserRouter>
          <AppointmentsOverview match={match} />
        </BrowserRouter>
      );
    });

    await wait(() => {
      const thead = wrapper.container.querySelector("thead");
      const tbody = wrapper.container.querySelector("tbody");

      const date = tbody.children[0].children[0].innerHTML;
      const serviceStatus = tbody.children[1].children[1].innerHTML;
      const serviceStatusString =
        appointment.data[0].service.name +
        '<div class="status">' +
        appointment.data[0].status +
        "</div>";
      expect(date).toEqual(
        dayjs(appointment.data[0].startDateTime).format("YY:MM:DD")
      );
      expect(serviceStatus).toEqual(serviceStatusString);
      expect(getAppointments).toHaveBeenCalledTimes(1);
      expect(thead.children[0].children.length).toBe(3);
      expect(thead.children[0].children[0].innerHTML).toBe("Date");
      expect(thead.children[0].children[1].innerHTML).toBe(
        "Service Name, Status"
      );
    });
  }, 6000);
});
