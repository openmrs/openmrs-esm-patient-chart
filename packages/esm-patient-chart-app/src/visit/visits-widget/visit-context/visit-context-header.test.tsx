import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockCurrentVisit } from '__mocks__';
import React from 'react';
import VisitContextHeader from './visit-context-header.extension';

const mockUseSystemVisitSetting = vi.mocked(useSystemVisitSetting);

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useSystemVisitSetting: vi.fn(),
}));

describe('VisitContextHeader', () => {
  beforeEach(() => {
    mockUseSystemVisitSetting.mockReturnValue({
      systemVisitEnabled: true,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });
  });

  it('should not show header if system does not support visits', () => {
    mockUseSystemVisitSetting.mockReturnValueOnce({
      systemVisitEnabled: false,
      errorFetchingSystemVisitSetting: null,
      isLoadingSystemVisitSetting: false,
    });

    render(<VisitContextHeader visitContext={null} mode={'create'} />);
    expect(screen.queryByText('Adding to')).not.toBeInTheDocument();
  });

  it('should show the current visit', () => {
    render(<VisitContextHeader visitContext={mockCurrentVisit} mode={'create'} />);
    expect(screen.getByText(/Adding to/i)).toBeInTheDocument();
    expect(screen.getByText(mockCurrentVisit.visitType.display)).toBeInTheDocument();
  });

  it('should default to showing that encounters are being added to the visit', () => {
    render(<VisitContextHeader visitContext={mockCurrentVisit} />);
    expect(screen.getByText(/Adding to/i)).toBeInTheDocument();
  });

  it('should indicate that an encounter is being edited in the visit it belongs to', () => {
    render(<VisitContextHeader visitContext={mockCurrentVisit} mode={'edit'} />);
    expect(screen.getByText(/Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Adding to/i)).not.toBeInTheDocument();
  });
});
