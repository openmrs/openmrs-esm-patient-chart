import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useConnectedExtensions } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import PatientBanner from './patient-banner.component';

class ResizeObserverMock {
  callback: any;
  contentRect: { width: number };
  constructor(callback) {
    this.callback = callback;
    this.contentRect = { width: 1000 };
  }
  observe(target) {
    this.callback([{ target, contentRect: this.contentRect }]);
  }
  unobserve() {}
  disconnect() {}
}

const testProps = {
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

const mockNavigateTo = jest.fn();
const mockUseConnectedExtensions = useConnectedExtensions as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
  age: jest.fn(),
  Breakpoint: { TABLET_MAX: 1023 },
  useConnectedExtensions: jest.fn(() => [{}, {}]),
}));

describe('PatientBanner: ', () => {
  it('renders information about a patient in a banner above the patient chart', () => {
    window.ResizeObserver = ResizeObserverMock;

    renderPatientBanner();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveClass('patientAvatar');
    expect(screen.getByText(/John Wilson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Actions$/i })).toBeInTheDocument();
    expect(screen.getByText(/04 — Apr — 1972/i)).toBeInTheDocument();
    expect(screen.getByText(/100GEJ/i)).toBeInTheDocument();
    expect(screen.getByText(/100732HE/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenMRS ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Old Identification Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Show details$/i })).toBeInTheDocument();
  });

  it('shoulld not render actions menu if no actions connected', () => {
    window.ResizeObserver = ResizeObserverMock;
    mockUseConnectedExtensions.mockReturnValue([]); // override the default mock to one that returns an empty array

    renderPatientBanner();
    expect(screen.queryByRole('button', { name: /^Actions$/i })).not.toBeInTheDocument();
  });

  it("can toggle between showing or hiding the patient's contact details", async () => {
    const user = userEvent.setup();

    window.ResizeObserver = ResizeObserverMock;
    renderPatientBanner();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show details$/i,
    });

    await user.click(showContactDetailsBtn);

    const hideDetailsBtn = screen.getByRole('button', {
      name: /^Hide details$/i,
    });
    expect(hideDetailsBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();

    await user.click(hideDetailsBtn);

    expect(showContactDetailsBtn).toBeInTheDocument();
  });

  it('should allow navigate to patient-chart on patient-search', async () => {
    const user = userEvent.setup();

    const patientBannerSeachPageProps = { ...testProps, onClick: mockNavigateTo };
    window.ResizeObserver = ResizeObserverMock;
    render(<PatientBanner {...patientBannerSeachPageProps} />);

    const imgAvatar = screen.getByRole('img');

    await user.click(imgAvatar);

    expect(mockNavigateTo).toHaveBeenCalledWith(patientBannerSeachPageProps.patientUuid);
    mockNavigateTo.mockClear();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show details$/i,
    });

    await user.click(showContactDetailsBtn);

    expect(mockNavigateTo).toHaveBeenCalledTimes(1);

    const hideDetailsBtn = screen.getByRole('button', {
      name: /^Hide details$/i,
    });
    expect(hideDetailsBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();
  });
});

function renderPatientBanner() {
  render(<PatientBanner {...testProps} />);
}
