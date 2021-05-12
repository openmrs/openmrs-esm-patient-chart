import React from "react";
import { screen, render } from "@testing-library/react";
import PatientChartPagination from "./pagination.component";
import userEvent from "@testing-library/user-event";

const mockOnPageNumberChange = jest.fn();

describe("<PatientChartPagination/>", () => {
  const mockCurrentPage = [
    {
      uuid: "d2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a",
      name: "Admission (Simple)",
      encounterTypeUuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
      encounterTypeName: "Admission",
    },
    {
      uuid: "1dfe36b9-7a85-429a-b71d-008a6afca574",
      name: "Biometrics",
      encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterTypeName: "Vitals",
    },
  ];
  const mockItems = [
    {
      uuid: "d2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a",
      name: "Admission (Simple)",
      encounterTypeUuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
      encounterTypeName: "Admission",
    },
    {
      uuid: "1dfe36b9-7a85-429a-b71d-008a6afca574",
      name: "Biometrics",
      encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterTypeName: "Vitals",
    },
    {
      uuid: "d2c7532c-fb01-11e2-8ff2-fd54ab5fdb2ae",
      name: "Transfer out (Simple)",
      encounterTypeUuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
      encounterTypeName: "Admission",
    },
    {
      uuid: "1dfe36b9-7a85-429a-b71d-008a6afca574",
      name: "POC Ampath MOH",
      encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterTypeName: "Vitals",
    },
    {
      uuid: "1dfe36b9-7a85-429a-b71d-008a6afca5shs4",
      name: "POC Ampath MOH Test",
      encounterTypeUuid: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterTypeName: "Vitals",
    },
  ];
  beforeEach(() => {
    render(
      <PatientChartPagination
        items={mockItems}
        pageUrl="forms"
        pageSize={2}
        pageNumber={1}
        onPageNumberChange={mockOnPageNumberChange}
        currentPage={mockCurrentPage}
      />
    );
  });

  it("should display correct page number", () => {
    const previousPage = screen.getByRole("button", { name: /Previous Page/i });
    expect(previousPage).toHaveProperty("disabled");
    const nextPage = screen.getByRole("button", { name: /Next Page/i });
    expect(nextPage).toBeInTheDocument();
    expect(screen.getByText("2 / 5 items")).toBeInTheDocument();
    expect(screen.getByText("See all")).toBeInTheDocument();
    expect(screen.getByText(/Page number, of 3 pages/i)).toBeInTheDocument();
    expect(screen.getByText(/1–2 of 5 items/i)).toBeInTheDocument();
  });

  it("should navigate to next and previous pages", () => {
    const nextPage = screen.getByRole("button", { name: /Next Page/i });
    userEvent.click(nextPage);
    expect(mockOnPageNumberChange).toHaveBeenCalledWith({
      page: 2,
      pageSize: 2,
    });
    expect(screen.getByText(/3–4 of 5 items/i)).toBeInTheDocument();
    userEvent.click(nextPage);
    expect(screen.getByText(/5–5 of 5 items/i)).toBeInTheDocument();
    const previousPage = screen.getByRole("button", { name: /Previous Page/i });
    userEvent.click(previousPage);
    expect(screen.getByText(/3–4 of 5 items/)).toBeInTheDocument();
    userEvent.click(previousPage);
    expect(screen.getByText(/1–2 of 5 items/i)).toBeInTheDocument();
    expect(mockOnPageNumberChange).toHaveBeenCalledTimes(4);
  });
});
