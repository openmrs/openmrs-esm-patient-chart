import { MedicationButton } from "./medication-button.component";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

describe("<MedicationButton/>", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without dying", () => {
    const wrapper = render(
      <BrowserRouter>
        <MedicationButton />
      </BrowserRouter>
    );
  });
});
