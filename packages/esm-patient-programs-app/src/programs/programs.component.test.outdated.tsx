import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Programs from './programs.component';

describe('<ProgramsComponent />', () => {
  it('renders without dying', () => {
    render(
      <BrowserRouter>
        <Programs />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: /Care Programs/i })).toBeInTheDocument();
  });
});
