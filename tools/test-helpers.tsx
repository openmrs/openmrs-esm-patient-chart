import React from 'react';
import { SWRConfig } from 'swr';
import { type RenderOptions, render, screen, waitForElementToBeRemoved } from '@testing-library/react';

// This component wraps whatever component is passed to it with an SWRConfig context which provides a global configuration for all SWR hooks.
const swrWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        // Sets the `dedupingInterval` to 0 - we don't need to dedupe requests in our test environment.
        dedupingInterval: 0,
        // Returns a new Map object, effectively wrapping our application with an empty cache provider. This is useful for resetting the SWR cache between test cases.
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Render the provided component within the wrapper we created above
export const renderWithSwr = (ui, options?) => render(ui, { wrapper: swrWrapper, ...options });

// Helper function that waits for a loading state to disappear from the screen
export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole('progressbar')], {
    timeout: 4000,
  });
}

// Custom matcher that queries elements split up by multiple HTML elements by text
export function getByTextWithMarkup(text: RegExp | string) {
  try {
    return screen.getByText((content, node) => {
      const hasText = (node: Element) => node.textContent === text || node.textContent.match(text);
      const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child as HTMLElement));
      return hasText(node) && childrenDontHaveText;
    });
  } catch (error) {
    throw new Error(`Text '${text}' not found. ${error}`);
  }
}

export const mockPatient = {
  resourceType: 'Patient',
  id: '8673ee4f-e2ab-4077-ba55-4980f408773e',
  extension: [
    {
      url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
      valueDateTime: '2017-01-18T09:42:40+00:00',
    },
    {
      url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
      valueString: 'daemon',
    },
  ],
  identifier: [
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'secondary',
      system: 'Old Identification Number',
      type: { text: 'Old Identification Number' },
      value: '100732HE',
    },
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'usual',
      system: 'OpenMRS ID',
      type: { text: 'OpenMRS ID' },
      value: '100GEJ',
    },
  ],
  active: true,
  name: [
    {
      id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
      use: 'usual',
      family: 'Wilson',
      given: ['John'],
    },
  ],
  gender: 'male',
  birthDate: '1972-04-04',
  deceasedBoolean: false,
  address: [
    {
      id: '0c244eae-85c8-4cc9-b168-96b51f864e77',
      use: 'home',
      line: ['Address10351'],
      city: 'City0351',
      state: 'State0351tested',
      postalCode: '60351',
      country: 'Country0351',
    },
  ],
  telecom: [
    {
      system: 'Mobile',
      value: '+25467388299499',
    },
  ],
};

export const mockPatientWithLongName = {
  ...mockPatient,
  name: [
    {
      id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
      use: 'usual',
      family: 'family name',
      given: ['Some very long given name'],
    },
  ],
};

export const patientChartBasePath = `/patient/${mockPatient.id}/chart`;
