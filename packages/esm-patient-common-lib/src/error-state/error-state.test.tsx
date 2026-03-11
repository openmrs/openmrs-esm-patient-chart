import React from 'react';
import { render, screen } from '@testing-library/react';
import { type FetchError } from '@openmrs/esm-framework';
import { ErrorState } from '.';

describe('ErrorState', () => {
  it('renders an error state widget card', () => {
    const testError: FetchError = {
      response: { status: 500, statusText: 'Internal Server Error' } as Response,
      responseBody: null,
    };
    render(<ErrorState headerTitle="appointments" error={testError} />);

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 500: Internal Server Error/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./i,
      ),
    ).toBeInTheDocument();
  });
});
