import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait, act, fireEvent } from "@testing-library/react";
import Pagination from "./pagination.component";

let totalData;
let resultsPerPage;
let paginate;
let wrapper;
describe("<Pagination/>", () => {
  beforeEach(() => {
    totalData = 30;
    resultsPerPage = 10;
    paginate = (indexOfFirstResult: number, indexOfLastResult: number) => {};
  });
  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <Pagination
          resultsPerPage={resultsPerPage}
          totalData={totalData}
          paginate={paginate}
        />
      </BrowserRouter>
    );
  });

  it("displays pagination buttons when there are results > 10", async () => {
    const { container, getByText, queryByText } = render(
      <Pagination
        resultsPerPage={resultsPerPage}
        totalData={totalData}
        paginate={paginate}
      />
    );
    const div = container.querySelector("div");
    expect(queryByText(/next/i)).toBeNull;
    expect(queryByText(/previous/i)).toBeNull;
    act(() => {
      fireEvent.click(getByText(/next/i));
    });
    await wait(() => {
      expect(div.children[0].children[0].textContent).toBe("Previous");
      const nextBtn = getByText(/next/i);
      expect(nextBtn).not.toBeNull;
      fireEvent.click(nextBtn);
      expect(getByText(/previous/i)).not.toBeNull;
    });
    act(() => {
      fireEvent.click(getByText(/previous/i));
    });
  });
  it("should not display next on the last page", async () => {
    const { container, getByText, queryByText } = render(
      <Pagination
        resultsPerPage={resultsPerPage}
        totalData={totalData}
        paginate={paginate}
      />
    );
    act(() => {
      fireEvent.click(getByText(/next/i));
    });
    await wait(() => {
      const nextBtn = getByText(/next/i);
      expect(nextBtn).not.toBeNull;
      fireEvent.click(nextBtn);
      expect(nextBtn).toBeNull;
      expect(getByText(/previous/i)).not.toBeNull;
    });
  });
  it("should not dispaly previous on the first page", async () => {
    const { container, getByText, queryByText } = render(
      <Pagination
        resultsPerPage={resultsPerPage}
        totalData={totalData}
        paginate={paginate}
      />
    );
    act(() => {
      fireEvent.click(getByText(/next/i));
    });
    await wait(() => {
      const previous = getByText(/previous/i);
      expect(previous).not.toBeNull;
      fireEvent.click(previous);
      expect(previous).toBeNull;
    });
  });
});
