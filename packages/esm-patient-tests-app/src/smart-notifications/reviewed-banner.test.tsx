import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { configSchema, type ConfigObject } from '../config-schema';
import { _resetReviewStore, markNotificationReviewed, setReviewUser } from './review-store';
import ReviewedBanner from './reviewed-banner.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

describe('ReviewedBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetReviewStore();
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema) as ConfigObject);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-29T09:30:00.000Z'));
  });

  it('renders nothing until a notification has been reviewed', () => {
    const { container } = render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('confirms the review, naming the test, the reviewer and how long ago it was', () => {
    setReviewUser('user-uuid-1');
    markNotificationReviewed('notification-1', mockPatient.id, 'Dr. Sarah Smith', 'Serum creatinine');

    render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(screen.getByText('Serum creatinine reviewed')).toBeInTheDocument();
    expect(screen.getByText('Reviewed by Dr. Sarah Smith · Just now')).toBeInTheDocument();
  });

  it('falls back to the generic wording for a review recorded before labels were stored', () => {
    setReviewUser('user-uuid-1');
    markNotificationReviewed('notification-1', mockPatient.id, 'Dr. Sarah Smith');

    render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(screen.getByText('Result reviewed')).toBeInTheDocument();
  });

  it('stops confirming a review that has fallen out of the banner window', () => {
    setReviewUser('user-uuid-1');
    markNotificationReviewed('notification-1', mockPatient.id, 'Dr. Sarah Smith', 'Serum creatinine');
    // A fortnight later the dashboard should not still open on a green "reviewed" strip.
    vi.setSystemTime(new Date('2026-07-13T09:30:00.000Z'));

    const { container } = render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not show another patient’s review', () => {
    setReviewUser('user-uuid-1');
    markNotificationReviewed('notification-1', 'another-patient-uuid', 'Dr. Sarah Smith');

    const { container } = render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when smart notifications are disabled', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      smartNotifications: {
        enabled: false,
        notifyOnAbnormalNonCritical: false,
        locationScoped: true,
        pollingIntervalMs: 30000,
      },
    } as ConfigObject);
    setReviewUser('user-uuid-1');
    markNotificationReviewed('notification-1', mockPatient.id, 'Dr. Sarah Smith');

    const { container } = render(<ReviewedBanner patientUuid={mockPatient.id} />);

    expect(container).toBeEmptyDOMElement();
  });
});
