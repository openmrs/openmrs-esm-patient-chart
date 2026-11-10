import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { mockPatient } from 'tools';
import PatientBanner from './patient-banner.component';

const toggleButtonText = 'Patient Banner Toggle Contact Details Button';

let resizeCallback: ResizeObserverCallback;

class ControllableResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

function resizeBannerTo(width: number) {
  act(() => {
    resizeCallback([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver);
  });
}

function getButtonCol() {
  return screen.getByTestId('patient-banner-button-col');
}

describe('PatientBanner', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ControllableResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the toggle contact details button in the header row at typical widths', () => {
    render(<PatientBanner patient={mockPatient} patientUuid={mockPatient.id} />);
    resizeBannerTo(800);

    expect(within(getButtonCol()).getByText(toggleButtonText)).toBeInTheDocument();
  });

  it('moves the toggle contact details button below the header when the banner is 520px or narrower', () => {
    render(<PatientBanner patient={mockPatient} patientUuid={mockPatient.id} />);
    resizeBannerTo(800);
    resizeBannerTo(500);

    expect(within(getButtonCol()).queryByText(toggleButtonText)).not.toBeInTheDocument();
    expect(screen.getByText(toggleButtonText)).toBeInTheDocument();
  });

  it('moves the toggle contact details button back into the header row when the banner widens again', () => {
    render(<PatientBanner patient={mockPatient} patientUuid={mockPatient.id} />);
    resizeBannerTo(500);
    resizeBannerTo(800);

    expect(within(getButtonCol()).getByText(toggleButtonText)).toBeInTheDocument();
  });
});
