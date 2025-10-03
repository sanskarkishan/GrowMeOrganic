import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// 👇 Local type for pagination event (PrimeReact doesn't export this)
interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export const Home: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<any[]>([]);
  const [rowClick, setRowClick] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [selectCount, setSelectCount] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const rowsPerPage = 12;
  const overlayRef = useRef<OverlayPanel>(null);

  // ✅ fetch one page
  const fetchData = async (offset: number) => {
    setLoading(true);
    const page = Math.floor(offset / rowsPerPage) + 1;

    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );
      const data = await res.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(first);
  }, [first]);

  // ✅ pagination handler
  const onPageChange = (e: PageEvent) => {
    setFirst(e.first);
  };

  // ✅ Fetch multiple pages until enough rows are selected
  const handleSelectSubmit = async () => {
    if (!selectCount || selectCount <= 0) return;

    setBulkLoading(true);
    let selected: any[] = [];
    let remaining = selectCount;
    let currentPage = Math.floor(first / rowsPerPage) + 1;

    try {
      while (remaining > 0) {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rowsPerPage}`
        );
        const data = await res.json();

        if (!data.data || data.data.length === 0) break; // stop if no more

        const needed = data.data.slice(0, remaining);
        selected = [...selected, ...needed];
        remaining -= needed.length;
        currentPage++;
      }

      setSelectedArtworks(selected);
      overlayRef.current?.hide();
    } catch (err) {
      console.error("Error fetching multiple pages:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const headerTemplate = () => (
    <div className="flex items-center gap-2">
      <i
        className="pi pi-chevron-down text-black cursor-pointer"
        style={{ fontSize: "1.2rem" }}
        onClick={(e) => overlayRef.current?.toggle(e)}
      />
      <span>🎨 Title</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
      <h1 className="text-4xl font-bold text-center text-white mb-10 underline">
        Assignment for Internship – GrowMeOrganic
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
        {/* Row click toggle */}
        <div className="flex items-center gap-3 mb-4">
          <InputSwitch
            inputId="input-rowclick"
            checked={rowClick}
            onChange={(e) => setRowClick(e.value as boolean)}
          />
          <label htmlFor="input-rowclick" className="text-sm text-gray-700">
            Row Click Selection
          </label>
        </div>

        {/* Pagination info */}
        <p className="text-sm text-gray-600 mb-2">
          Showing page{" "}
          <span className="font-semibold text-indigo-600">
            {Math.floor(first / rowsPerPage) + 1}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-indigo-600">
            {Math.ceil(totalRecords / rowsPerPage)}
          </span>
        </p>

        {/* DataTable */}
        <DataTable
          value={artworks}
          loading={loading}
          paginator
          lazy
          rows={rowsPerPage}
          totalRecords={totalRecords}
          first={first}
          onPage={onPageChange}
          selectionMode={rowClick ? "checkbox" : undefined}
          selection={selectedArtworks}
          onSelectionChange={(e) => setSelectedArtworks(e.value)}
          dataKey="id"
          stripedRows
          className="min-w-full text-sm"
          tableStyle={{ tableLayout: "fixed" }}
        >
          {rowClick && (
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          )}
          <Column
            field="title"
            header={headerTemplate}
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
            bodyClassName="px-4 py-2 font-medium text-gray-800"
          />
          <Column
            field="place_of_origin"
            header="🌍 Origin"
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
            bodyClassName="px-4 py-2 text-gray-700"
          />
          <Column
            field="artist_display"
            header="👤 Artist"
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
            bodyClassName="px-4 py-2 text-gray-700 truncate max-w-xs"
          />
          <Column
            field="inscriptions"
            header="✍️ Inscriptions"
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
            bodyClassName="px-4 py-2 text-gray-700 truncate max-w-xs"
          />
          <Column
            field="date_start"
            header="📅 Start"
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-right"
            bodyClassName="px-4 py-2 text-right text-gray-700"
          />
          <Column
            field="date_end"
            header="📅 End"
            headerClassName="bg-indigo-500 text-white px-4 py-2 text-right"
            bodyClassName="px-4 py-2 text-right text-gray-700"
          />
        </DataTable>

        {/* Overlay Panel for multi-select */}
        <OverlayPanel ref={overlayRef}>
          <div className="p-3 w-84">
            <label
              htmlFor="rowCount"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Select number of rows
            </label>
            <InputNumber
              id="rowCount"
              value={selectCount}
              onValueChange={(e) => setSelectCount(e.value ?? null)}
              showButtons
              min={1}
              max={totalRecords} // ✅ allow up to total records
              className="w-full mb-3"
            />

            {bulkLoading ? (
              <div className="flex justify-center py-4">
                <ProgressSpinner style={{ width: "40px", height: "40px" }} />
              </div>
            ) : (
              <Button
                label="Submit"
                icon="pi pi-check"
                onClick={handleSelectSubmit}
                className="w-full"
              />
            )}
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
};
