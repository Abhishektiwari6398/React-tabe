import React, { useEffect, useState, useCallback, useRef } from "react";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Paginator } from "primereact/paginator";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  date_start: string;
  date_end: string;
}

const Table: React.FC = () => {
  const [works, setWorks] = useState<Artwork[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const op = useRef<OverlayPanel>(null);


  const fetchWorks = async (page: number = currentPage) => {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
    );
    const data = await response.json();
    setTotalRecords(data.pagination.total || 0);
    return data.data;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchedArtworks = await fetchWorks(currentPage);
      setWorks(fetchedArtworks);
    };
    fetchData();
  }, [currentPage, rowsPerPage]);


  const onCheckboxChange = (rowIndex: number, checked: boolean) => {
    const globalRowIndex = (currentPage - 1) * rowsPerPage + rowIndex;
    setSelectedRows((prev) => {
      const updatedRows = new Set(prev);
      if (checked) {
        updatedRows.add(globalRowIndex);
      } else {
        updatedRows.delete(globalRowIndex);
      }
      return updatedRows;
    });
  };


  const isRowSelected = useCallback((rowIndex: number) => {
    const globalRowIndex = (currentPage - 1) * rowsPerPage + rowIndex;
    return selectedRows.has(globalRowIndex);
  }, [currentPage, selectedRows]);


  const handleSelectAllChange = (checked: boolean) => {
    setIsSelectAllChecked(checked);
    setSelectedRows(() => {
      const updatedRows = new Set<number>();
      if (checked) {
        for (let page = 1; page <= Math.ceil(totalRecords / rowsPerPage); page++) {
          const rowsOnPage = Math.min(rowsPerPage, totalRecords - (page - 1) * rowsPerPage);
          for (let index = 0; index < rowsOnPage; index++) {
            const globalIndex = (page - 1) * rowsPerPage + index;
            updatedRows.add(globalIndex);
          }
        }
      }
      return updatedRows;
    });
  };



  const handleSubmit = async () => {
    const numRows = parseInt(inputValue, 10);
    if (!isNaN(numRows) && numRows > 0) {
      setSelectedRows((prev) => {
        const newSelection = new Set(prev);
        const start = (currentPage - 1) * rowsPerPage;
        for (let i = 0; i < numRows && i + start < totalRecords; i++) {
          newSelection.add(start + i);
        }
        return newSelection;
      });
    }
    op.current?.hide();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">Table</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-center">
                <Checkbox
                  checked={isSelectAllChecked}
                  onChange={(e) => handleSelectAllChange(e.checked as boolean)}
                  aria-label="Select all rows"
                />
              </th>
              <th className="px-4 py-2 relative">
                Title{" "}
                <i
                  className="pi pi-chevron-down cursor-pointer ml-3"
                  onClick={(e) => op.current?.toggle(e)}
                ></i>
                <OverlayPanel ref={op} showCloseIcon>
                  <div className="p-2">
                    <InputText
                      placeholder="Select rows..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full mb-2"
                    />
                    <Button
                      label="Submit"
                      onClick={handleSubmit}
                      className="p-button-sm p-button-primary w-full"
                    />
                  </div>
                </OverlayPanel>
              </th>
              <th className="px-4 py-2">Place of Origin</th>
              <th className="px-4 py-2">Artist Display</th>
              <th className="px-4 py-2">Date Start</th>
              <th className="px-4 py-2">Date End</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work, index) => (
              <tr
                key={work.id}
                className={`${isRowSelected(index) ? "bg-green-200" : "bg-slate-100"}`}
              >
                <td className="border px-4 py-2 text-center">
                  <Checkbox
                    checked={isRowSelected(index)}
                    onChange={(e) => onCheckboxChange(index, e.checked as boolean)}
                    aria-label={`Select artwork ${work.title || "N/A"}`}
                  />
                </td>
                <td className="border px-4 py-2">{work.title || "N/A"}</td>
                <td className="border px-4 py-2">{work.place_of_origin || "N/A"}</td>
                <td className="border px-4 py-2">{work.artist_display || "N/A"}</td>
                <td className="border px-4 py-2">{work.date_start || "N/A"}</td>
                <td className="border px-4 py-2">{work.date_end || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={(e) => handlePageChange(e.page + 1)}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        />
      </div>
    </div>
  );
};

export default Table;
