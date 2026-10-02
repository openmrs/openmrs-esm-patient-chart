import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDate, getDefaultsFromConfigSchema, useConfig, useVisit } from '@openmrs/esm-framework';
import { type ChartConfig, esmPatientChartSchema } from '../config-schema';
import VisitAttributeTags from './visit-attribute-tags.extension';

const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUseVisit = vi.mocked(useVisit);

const dateAttributeTypeUuid = 'f2e6c103-2d54-4645-b2bb-32f4f31d1710';

function renderWithDateAttribute(savedValue: string) {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(esmPatientChartSchema),
    visitAttributeTypes: [{ uuid: dateAttributeTypeUuid, required: false, displayInThePatientBanner: true }],
  });
  mockUseVisit.mockReturnValue({
    activeVisit: {
      uuid: 'visit-uuid',
      attributes: [
        {
          uuid: 'attribute-uuid',
          display: 'Follow-up date',
          attributeType: {
            uuid: dateAttributeTypeUuid,
            name: 'Follow-up date',
            datatypeClassname: 'org.openmrs.customdatatype.datatype.DateDatatype',
          },
          value: savedValue,
        },
      ],
    },
  } as unknown as ReturnType<typeof useVisit>);

  render(<VisitAttributeTags patientUuid="patient-uuid" />);
}

describe('VisitAttributeTags', () => {
  const savedDay = formatDate(new Date(2026, 9, 20), { mode: 'wide' });

  // The REST API returns a saved date at midnight in the server's offset. Tests run in UTC,
  // so a server at +05:30 is ahead of the browser, as a UTC server is ahead of a browser in America.
  it('shows a date attribute saved by a server ahead of the browser on the saved day', () => {
    renderWithDateAttribute('2026-10-20T00:00:00.000+0530');

    expect(screen.getByText(savedDay)).toBeInTheDocument();
  });

  it('shows a date attribute saved by a server in the browser time zone on the saved day', () => {
    renderWithDateAttribute('2026-10-20T00:00:00.000+0000');

    expect(screen.getByText(savedDay)).toBeInTheDocument();
  });
});
