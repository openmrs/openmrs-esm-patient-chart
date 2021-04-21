import React from "react";
import { getPatientBiometrics } from "./biometric.resource";
import { render, screen } from "@testing-library/react";
import BiometricOverview from "./biometrics-overview.component";
import { ConfigMock } from "../../__mocks__/chart-widgets-config.mock";
import { of } from "rxjs";

const mockGetPatientBiometric = getPatientBiometrics as jest.Mock;

jest.mock("./biometric.resource", () => ({
  getPatientBiometrics: jest.fn(),
}));

describe("<Biometric/>", () => {
  const mockBiometrics = [
    {
      id: "bca4d5f1-ee6a-4282-a5ff-c8db12c4247c",
      weight: 65,
      height: 185,
      date: "27-Nov 12:06 PM",
      bmi: "24.8",
    },
    {
      id: "1ca4d5f1-ee6a-4282-a5ff-c8db12c4247c",
      weight: 100,
      height: 180,
      date: "28-Nov 12:06 PM",
      bmi: "25.8",
    },
  ];

  it("should render patient biometrics", () => {
    mockGetPatientBiometric.mockReturnValue(of(mockBiometrics));
    render(<BiometricOverview config={ConfigMock} />);

    expect(screen.getAllByText(/Date/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Weight/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Height/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/BMI/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/27 - Nov - 2001/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/65/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/185/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/24.8/i)[0]).toBeInTheDocument();
  });

  it("should display empty biometrics", () => {
    mockGetPatientBiometric.mockReturnValue(of([]));
    const wrapper = render(<BiometricOverview config={ConfigMock} />);
    expect(
      screen.getByText("There are no biometrics to display for this patient")
    ).toBeInTheDocument();
  });
});
