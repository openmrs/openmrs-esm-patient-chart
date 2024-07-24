import { isDesktop } from './utils';

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
