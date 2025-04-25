import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { mockPanelData } from '__mocks__';
import IndividualResultsTableTablet from './individual-results-table-tablet.component';
import usePanelData from './usePanelData';

const mockIsDesktop = jest.mocked(isDesktop);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUsePanelData = jest.mocked(usePanelData);

jest.mock('./usePanelData');

describe('PanelView', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);
    mockUsePanelData.mockReturnValue(mockPanelData);
  });

  it('renders a loading state when data is loading', () => {
    mockUsePanelData.mockReturnValue({ ...mockPanelData, isLoading: true });

    render(
      <IndividualResultsTableTablet expanded={false} testUuid="" type="" basePath="" patientUuid="test-patient" />,
    );

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('renders an empty state when there are no panels to display', () => {
    mockUsePanelData.mockReturnValue({ ...mockPanelData, panels: [] });

    render(
      <IndividualResultsTableTablet expanded={false} testUuid="" type="" basePath="" patientUuid="test-patient" />,
    );

    expect(screen.getByText(/no panels found/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no panels to display for this patient/i)).toBeInTheDocument();
  });

  it('renders the panel view when data is loaded', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockIsDesktop.mockReturnValue(true);

    render(
      <IndividualResultsTableTablet expanded={false} testUuid="" type="" basePath="" patientUuid="test-patient" />,
    );

    expect(screen.getByRole('heading', { name: /panel/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /red blood cells/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hematocrit/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /red blood cells 5.9/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 46/i })).toBeInTheDocument();
  });

  it('filters the panel view when searching for a test', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');
    mockUsePanelData.mockReturnValue({ ...mockPanelData, isLoading: false });

    render(
      <IndividualResultsTableTablet expanded={false} testUuid="" type="" basePath="" patientUuid="test-patient" />,
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /panel/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /red blood cells/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hematocrit/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /red blood cells 5.9/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 46/i })).toBeInTheDocument();

    await user.click(searchButton);

    const searchBox = screen.getByPlaceholderText(/search by test name/i);
    expect(searchBox).toBeInTheDocument();

    await user.type(searchBox, 'hematocrit');
    await user.keyboard('{Enter}');

    expect(screen.queryByRole('row', { name: /red blood cells 5.9/i })).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 46/i })).toBeInTheDocument();
  });

  it('selecting a test opens the timeline view on tablet', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(true);

    render(
      <IndividualResultsTableTablet expanded={false} testUuid="" type="" basePath="" patientUuid="test-patient" />,
    );

    const hematocritCell = screen.getByRole('cell', { name: /hematocrit/i });
    await user.click(hematocritCell);

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
    expect(screen.getByRole('banner', { name: /hematocrit/i })).toBeInTheDocument();

    await user.click(backButton);

    expect(backButton).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /panel/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hematocrit 46/i })).toBeInTheDocument();
  });
});
