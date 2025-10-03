import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";

import { fetchArtworks, fetchMultipleArtworks, type Artwork } from "../api/api";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export const Home = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [rowClick, setRowClick] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [selectCount, setSelectCount] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const rowsPerPage = 12;
  const overlayRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const page = Math.floor(first / rowsPerPage) + 1;
        const data = await fetchArtworks(page, rowsPerPage);
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
      } catch (err) {
        console.error("Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [first]);

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  const handleSelectSubmit = async () => {
    if (!selectCount || selectCount <= 0) return;
    setBulkLoading(true);
    try {
      const currentPage = Math.floor(first / rowsPerPage) + 1;
      const selected = await fetchMultipleArtworks(currentPage, selectCount, rowsPerPage);
      setSelectedArtworks(selected);
      overlayRef.current?.hide();
    } catch (err) {
      console.error("Error fetching multiple artworks:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const headerTemplate = () => (
    <div className="flex items-center gap-2">
      <i
        className="pi pi-chevron-down text-black cursor-pointer"
        title="Select rows"
        style={{ fontSize: "1.2rem" }}
        onClick={(e) => overlayRef.current?.toggle(e)}
      />
      <span>🎨 Title</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 sm:mb-10 underline">
        Assignment for Internship – GrowMeOrganic
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 overflow-x-auto">
        {/* Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
          <InputSwitch
            inputId="input-rowclick"
            checked={rowClick}
            onChange={(e) => setRowClick(e.value)}
          />
          <label htmlFor="input-rowclick" className="text-sm sm:text-base text-gray-700">
            Row Click Selection
          </label>
        </div>

        {/* Pagination info */}
        <p className="text-sm sm:text-base text-gray-600 mb-2">
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
        <div className="overflow-x-auto">
          <DataTable
            value={artworks}
            loading={loading}
            paginator
            lazy
            rows={rowsPerPage}
            totalRecords={totalRecords}
            first={first}
            onPage={onPageChange}
            selectionMode={rowClick ? "checkbox" : null}
            selection={rowClick ? selectedArtworks : []}
            onSelectionChange={
              rowClick
                ? (e: { value: Artwork[] }) => setSelectedArtworks(e.value)
                : undefined
            }
            dataKey="id"
            stripedRows
            className="min-w-[600px] text-sm sm:text-base"
            tableStyle={{ tableLayout: "auto" }}
          >
            {rowClick && (
              <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            )}
            <Column
              field="title"
              header={headerTemplate}
              headerClassName="bg-indigo-500 text-white px-2 sm:px-4 py-2 text-left"
              bodyClassName="px-2 sm:px-4 py-2 font-medium text-gray-800"
            />
            <Column
              field="place_of_origin"
              header="Origin"
              headerClassName="bg-indigo-500 text-white px-2 sm:px-4 py-2 text-left"
              bodyClassName="px-2 sm:px-4 py-2 text-gray-700"
            />
            <Column
              field="artist_display"
              header="👤 Artist"
              headerClassName="bg-indigo-500 text-white px-2 sm:px-4 py-2 text-left"
              bodyClassName="px-2 sm:px-4 py-2 text-gray-700"
            />
            <Column
              field="inscriptions"
              header="✍️ Inscriptions"
              headerClassName="bg-indigo-500 text-white px-2 sm:px-4 py-2 text-left"
              bodyClassName="px-2 sm:px-4 py-2 text-gray-700"
            />
            <Column
              field="date_start"
              header="Start"
              headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
              bodyClassName="px-4 py-2 text-right text-gray-700"
            />
            <Column
              field="date_end"
              header="End"
              headerClassName="bg-indigo-500 text-white px-4 py-2 text-left"
              bodyClassName="px-4 py-2 text-right text-gray-700"
            />
          </DataTable>
        </div>

        {/* Overlay Panel */}
        <OverlayPanel ref={overlayRef}>
          <div className="p-3 w-72 sm:w-80">
            <label
              htmlFor="rowCount"
              className="block mb-2 text-sm sm:text-base font-medium text-gray-700"
            >
              Select number of rows
            </label>
            <InputNumber
              id="rowCount"
              value={selectCount}
              onValueChange={(e) => setSelectCount(e.value ?? null)}
              showButtons
              min={1}
              max={totalRecords}
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