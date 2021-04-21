import { render } from "@testing-library/react";
import React from "react";
import ClinicalViewOverview from "./clinical-view-overview.component";

describe("<ClinicalViewOverview/>", () => {
  beforeEach(() => {
    render(<ClinicalViewOverview />);
  });

  it("should render without dying", () => {
    pending();
  });
});
