import React from 'react';
import { vi, describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { type AssignedExtension, ExtensionSlot } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { DashboardView } from './dashboard-view.component';

const mockExtensionSlot = vi.mocked(ExtensionSlot);

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useMatch: vi.fn().mockReturnValue({
    params: {
      view: 'partograph',
    },
  }),
}));

const dashboard = {
  slot: 'patient-chart-partograph-dashboard-slot',
  title: 'Partograph',
  path: 'partograph',
  moduleName: '@openmrs/esm-patient-chart-app',
};

function makeExtension(id: string, meta: object, config: object | null) {
  return {
    id,
    name: id.split('#')[0],
    moduleName: '@openmrs/esm-generic-patient-widgets-app',
    meta,
    config,
  } as unknown as AssignedExtension;
}

describe('DashboardView', () => {
  test('resolves widget width from extension config, falling back to meta', () => {
    // Configured instances get #-suffixed ids, e.g. from
    // "add": ["obs-by-encounter-widget#partograph"] in an implementer's config.
    const extensions = [
      makeExtension('obs-by-encounter-widget#partograph', { fullWidth: false }, { fullWidth: true }),
      makeExtension('obs-table-horizontal-widget#tbScreening', { fullWidth: true }, null),
      makeExtension('obs-by-encounter-widget#vitals', { fullWidth: true }, { fullWidth: false }),
      makeExtension('obs-by-encounter-widget#labs', { fullWidth: false }, null),
    ];

    mockExtensionSlot.mockImplementation(({ children }) => (
      <div>
        {extensions.map((extension) => (
          <React.Fragment key={extension.id}>
            {typeof children === 'function' ? children(extension) : children}
          </React.Fragment>
        ))}
      </div>
    ));

    const { container } = render(
      <DashboardView dashboard={dashboard} patientUuid={mockPatient.id} patient={mockPatient} />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const wrappers = container.querySelectorAll('.extension');
    expect(wrappers).toHaveLength(4);
    // Config fullWidth: true overrides meta fullWidth: false.
    expect(wrappers[0]).toHaveClass('fullWidth');
    // Meta fullWidth: true is honored for a #-suffixed instance with no config yet.
    expect(wrappers[1]).toHaveClass('fullWidth');
    // Config fullWidth: false overrides meta fullWidth: true.
    expect(wrappers[2]).not.toHaveClass('fullWidth');
    // Neither config nor meta requests full width.
    expect(wrappers[3]).not.toHaveClass('fullWidth');
  });
});
