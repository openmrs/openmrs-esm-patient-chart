import { getPageWidth, isTablet } from "./sidebar-utils";
describe("isTablet", () => {
  it("is true when layout = tablet", () => {
    expect(isTablet("tablet")).toBeTruthy();
  });
  it("is true when layout = phone", () => {
    expect(isTablet("phone")).toBeTruthy();
  });
  it("is false is desktop", () => {
    expect(isTablet("desktop")).toBeFalsy();
  });
});

describe("getPageWidth", () => {
  it("returns full width if tablet or below", () => {
    expect(getPageWidth("tablet")).toEqual("100vw");
  });
  it("returns full width w/o sidebar if desktop", () => {
    expect(getPageWidth("desktop")).toEqual(
      "calc(100vw - var(--omrs-sidenav-width))"
    );
  });
});
