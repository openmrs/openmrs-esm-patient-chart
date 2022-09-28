import { isDesktop } from './utils';
import { isDesktop as actualIsDesktopFn } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    isDesktop: jest.fn().mockImplementation((layout) => layout === 'small-desktop' || layout === 'large-desktop'),
  };
});

describe('isDesktop', () => {
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
