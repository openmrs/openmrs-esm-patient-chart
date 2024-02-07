import React from 'react';
import { render, screen } from '@testing-library/react';
import AttachmentsOverview from './attachments-overview.component';
import { useAttachments } from '@openmrs/esm-framework';

const mockedUseAttachments = jest.mocked(useAttachments);

it('renders a loading skeleton when attachments are loading', () => {
  mockedUseAttachments.mockReturnValue({
    data: [],
    error: null,
    isLoading: true,
    isValidating: false,
    mutate: jest.fn(),
  });

  renderAttachmentsOverview();

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('renders an empty state if attachments are not available', () => {
  mockedUseAttachments.mockReturnValue({
    data: [],
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });

  renderAttachmentsOverview();

  expect(screen.getByText(/There are no attachments to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /record attachments/i })).toBeInTheDocument();
});

function renderAttachmentsOverview() {
  render(<AttachmentsOverview patientUuid="test-uuid" />);
}
