import React from 'react';
import { vi, it, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import AttachmentsOverview from './attachments-overview.component';
import { useAttachments } from '@openmrs/esm-framework';

const mockUseAttachments = vi.mocked(useAttachments);

it('renders a loading skeleton when attachments are loading', () => {
  mockUseAttachments.mockReturnValue({
    data: [],
    error: null,
    isLoading: true,
    isValidating: false,
    mutate: vi.fn(),
  });

  render(<AttachmentsOverview patientUuid="test-uuid" />);

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('renders an empty state if attachments are not available', () => {
  mockUseAttachments.mockReturnValue({
    data: [],
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  });

  render(<AttachmentsOverview patientUuid="test-uuid" />);

  expect(screen.getByText(/There are no attachments to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /record attachments/i })).toBeInTheDocument();
});
