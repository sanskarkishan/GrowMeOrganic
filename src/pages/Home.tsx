import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

export const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0); // offset for paginator
  const rowsPerPage = 12;

  const fetchData = (offset) => {
    setLoading(true);
    const page = Math.floor(offset / rowsPerPage) + 1;

    fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`)
      .then((res) => res.json())
      .then((data) => {
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(first);
  }, [first]);

  const onPageChange = (e) => {
    setFirst(e.first);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
      <h1 className="text-4xl font-bold text-center text-white mb-10 underline">
        Assignment for Internship – GrowMeOrganic
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
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

        <DataTable
          value={artworks}
          loading={loading}
          paginator
          lazy
          rows={rowsPerPage}
          totalRecords={totalRecords}
          first={first}
          onPage={onPageChange}
          stripedRows
          className="min-w-full text-sm"
          tableStyle={{ tableLayout: "fixed" }}
        >
          <Column
            field="title"
            header="🎨 Title"
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
      </div>
    </div>
  );
};