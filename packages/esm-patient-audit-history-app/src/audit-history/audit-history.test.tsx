import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useConfig, useSession, userHasAccess } from '@openmrs/esm-framework';
import { usePatientAuditHistory } from './audit-history.resource';
import AuditHistory from './audit-history.component';
import { formatRevisionDatetime } from './audit-log-format';

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
  mockUseConfig.mockReturnValue({ viewPrivilege: 'View Audit Logs', auditHistoryPageSize: 10 });
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
    expect(screen.getByRole('columnheader', { name: /changes/i })).toBeInTheDocument();

    expect(screen.getByText(formatRevisionDatetime('20/06/2026 14:30:45'))).toBeInTheDocument();
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
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText(/changed in the same save/i)).toBeInTheDocument();
    expect(screen.getByText('PersonName')).toBeInTheDocument();
  });

  it('tags a voided revision distinctly instead of "Updated"', () => {
    const voidLogs = [
      {
        revisionID: 20,
        entityType: 'Patient',
        eventType: 'MOD',
        changedBy: 'admin',
        changedOn: '21/06/2026 10:00:00',
        changes: [{ fieldName: 'voided', oldValue: 'false', currentValue: 'true', changed: true }],
        relatedEntities: [],
      },
    ];
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: voidLogs, totalLogs: 1 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByText(/voided/i)).toBeInTheDocument();
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
  });

  it('summarizes a Created revision instead of dumping every field', async () => {
    const user = userEvent.setup();
    const createdLogs = [
      {
        revisionID: 1,
        entityType: 'Patient',
        eventType: 'ADD',
        changedBy: 'admin',
        changedOn: '01/06/2026 08:00:00',
        changes: [
          { fieldName: 'gender', oldValue: '', currentValue: 'F', changed: true },
          { fieldName: 'birthdate', oldValue: '', currentValue: '1990-01-01T00:00:00Z', changed: true },
          { fieldName: 'dead', oldValue: '', currentValue: 'false', changed: true },
        ],
        relatedEntities: [],
      },
    ];
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: createdLogs, totalLogs: 1 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByText(/new record/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/expand current row/i));

    expect(screen.getByText(/record created/i)).toBeInTheDocument();
    expect(screen.getByText(/3 fields set/i)).toBeInTheDocument();
    expect(screen.queryByText(/previous value/i)).not.toBeInTheDocument();
  });

  it('renders pagination controls when there are records', () => {
    mockUsePatientAuditHistory.mockReturnValue({ ...baseReturn, logs: mockLogs, totalLogs: 25 } as any);

    render(<AuditHistory patientUuid="abc-123" />);

    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });
});
