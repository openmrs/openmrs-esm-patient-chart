import { render } from '@testing-library/react';
import React from 'react';
import ClinicalViewForm from './clinical-view-form.component';

describe('<ClinicalViewForm/>', () => {
  beforeEach(() => {
    render(<ClinicalViewForm />);
  });

  it('should render without dying', () => {
    pending();
  });
});
