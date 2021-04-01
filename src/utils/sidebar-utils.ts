import { LayoutType } from "@openmrs/esm-framework";

export const isTablet = (layout: LayoutType) =>
  layout === "phone" || layout === "tablet";
export const getPageWidth = layout =>
  isTablet(layout) ? "100vw" : "calc(100vw - var(--omrs-sidenav-width))";
