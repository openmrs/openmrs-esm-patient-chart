import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useConfig, useSession, userHasAccess } from '@openmrs/esm-framework';
import { usePatientAuditHistory } from './audit-history.resource';
import AuditHistory from './audit-history.component';

vi.mock('./audit-history.resource');

const mockUsePatientAuditHistory = vi.mocked(usePatientAuditHistory);
const mockUseConfig = useConfig as Mock;
const mockUseSession = useSession as Mock;
const mockUserHasAccess = userHasAccess as Mock;

const baseReturn = {
  logs: [],
  totalLogs: 0,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  isValidating: false,
  error: undefined,
  mutate: vi.fn(),
};

const mockLogs = [
  {
    revisionID: 12,
    entityType: 'Patient',
    eventType: 'MOD',
    changedBy: 'admin',
    changedOn: '20/06/2026 14:30:45',
    changes: [{ fieldName: 'gender', oldValue: 'F', currentValue: 'M', changed: true }],
    relatedEntities: [
      {
        className: 'org.openmrs.PersonName',
        simpleName: 'PersonName',
        entityIdValue: '5',
        revisionId: 12,
        revisionType: 'MOD',
      },
    ],
  },
  {
    revisionID: 9,
    entityType: 'Patient',
    eventType: 'ADD',
    changedBy: 'nurse1',
    changedOn: '18/06/2026 09:15:22',
    changes: [],
    relatedEntities: [],
  },
];

beforeEach(() => {
  mockUseConfig.mockReturnValue({ viewPrivilege: 'View Audit Log', auditHistoryPageSize: 10 });
  mockUseSession.mockReturnValue({ user: { display: 'admin', roles: [], privileges: [] } });
  mockUserHasAccess.mockReturnValue(true);
});

describe('AuditHistory', () => {
  it('renders a row per audit revision with the expected columns and event tags', () => {
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: mockLogs, totalLogs: 2 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByRole('columnheader', { name: /date & time/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /event/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /changed by/i })).toBeInTheDocument();

    expect(screen.getByText('20/06/2026 14:30:45')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('nurse1')).toBeInTheDocument();
    expect(screen.getByText(/updated/i)).toBeInTheDocument(); // MOD
    expect(screen.getByText(/created/i)).toBeInTheDocument(); // ADD
  });

  it('shows a loading skeleton while fetching', () => {
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, isLoading: true } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows the empty state when there are no records', () => {
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: [], totalLogs: 0 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
  });

  it('shows a helpful message when the auditlogweb module is not installed (404)', () => {
    mockUsePatientAuditHistory.mockReturnValue({
      ...baseReturn,
      error: { response: { status: 404 } },
    } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByText(/auditlogweb module is not installed/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('gates the widget on the view privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: mockLogs, totalLogs: 2 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('expands a revision to reveal its field-level diff and related entities', async () => {
    const user = userEvent.setup();
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: mockLogs, totalLogs: 2 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    const expandButtons = screen.getAllByLabelText(/expand current row/i);
    await user.click(expandButtons[0]);

    expect(screen.getByText(/change details/i)).toBeInTheDocument();
    expect(screen.getByText('gender')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText(/also changed in this revision/i)).toBeInTheDocument();
    expect(screen.getByText('PersonName')).toBeInTheDocument();
  });

  it('renders pagination controls when there are records', () => {
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: mockLogs, totalLogs: 25 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });
});
