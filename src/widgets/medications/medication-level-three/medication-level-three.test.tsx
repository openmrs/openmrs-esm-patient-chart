import React from "react";

import { render, cleanup, wait } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import MedicationCardLevelThree from "./medication-level-three.component";

describe("<MedicationCardLevelThree />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);

  it("renders without dying", async () => {
    wrapper = render(
      <BrowserRouter>
        <MedicationCardLevelThree match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });
});
