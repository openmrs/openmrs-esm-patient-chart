import { isDesktop } from './utils';
import { isDesktop as actualIsDesktopFn } from '@openmrs/esm-framework';

const mockIsDesktop = jest.mocked(actualIsDesktopFn);

describe('isDesktop', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockIsDesktop.mockImplementation((layout) => layout === 'small-desktop' || layout === 'large-desktop');
  });

  it('is true when layout = tablet', () => {
    expect(isDesktop('tablet')).toBeFalsy();
  });

  it('is true when layout = phone', () => {
    expect(isDesktop('phone')).toBeFalsy();
  });

  it('is false is desktop', () => {
    expect(isDesktop('small-desktop')).toBeTruthy();
    expect(isDesktop('large-desktop')).toBeTruthy();
  });
});
