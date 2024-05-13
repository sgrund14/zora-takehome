"use client";

import { useState, useCallback } from "react";

type Photo = {
  id: string;
  urls: { regular: string };
  color: string | null;
  description: string;
};

const colors = [
  "black_and_white",
  "black",
  "white",
  "yellow",
  "orange",
  "red",
  "purple",
  "magenta",
  "green",
  "teal",
  "blue",
];

// my take home test :)
// cleanup ideas:
// - refactor into smaller components for better legibility (Search, Filters, Results, Pagination)
// - improve loading placeholder so that there is less layout shift
// - move unsplash api search to server if you wanted to mask the api key
// - add error handling (some red text or something)

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldFetchLatest, setShouldFetchLatest] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<Photo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImages = useCallback(
    async ({
      query,
      color,
      orderBy,
      page,
    }: {
      query: string;
      page: number;
      color?: string;
      orderBy?: "latest";
    }) => {
      setResults(null);
      setIsLoading(true);
      setTotalPages(1);
      setCurrentPage(page);
      const queryParams = new URLSearchParams({
        client_id: "ukJyK7f_oSD8sRs6GytnZxaxCnv8XCiFi05QKrF_BeQ",
        page: `${page}`,
        per_page: "9",
      });
      queryParams.set("query", query);
      if (color) {
        queryParams.set("color", color);
      }
      if (orderBy) {
        queryParams.set("order_by", orderBy);
      }
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?${queryParams.toString()}`
        );
        const data = await res.json();
        if (data.errors) {
          setResults([]);
          setTotalPages(1);
        } else {
          const totalPages = data.total_pages;
          const photos = data.results as Photo[];
          setResults(photos);
          setTotalPages(totalPages);
        }
        setIsLoading(false);
      } catch {
        setResults([]);
        setTotalPages(1);
      }
    },
    []
  );

  return (
    <main className="flex min-h-screen flex-col items-center py-24 gap-5">
      {/* SEARCH INPUT */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          placeholder="Search"
          className="rounded-xl bg-gray-100 text-center py-2"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm) {
              fetchImages({
                query: searchTerm,
                color: selectedColor,
                orderBy: shouldFetchLatest ? "latest" : undefined,
                page: 1,
              });
            }
          }}
        />
        <button
          disabled={!searchTerm}
          onClick={() => {
            fetchImages({
              query: searchTerm,
              color: selectedColor,
              orderBy: shouldFetchLatest ? "latest" : undefined,
              page: 1,
            });
          }}
          className="h-[40px] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-blue-600 text-white px-4 py-[2px]"
        >
          Search
        </button>
      </div>

      {/* SORT AND FILTER TOOLBAR */}
      <div className="flex px-4 py-2 rounded-xl bg-gray-100 gap-3 max-w-[100vw] overflow-auto">
        <span className="flex gap-2 items-center shrink-0">
          <input
            type="checkbox"
            id="latest"
            name="latest"
            value="Latest"
            className="cursor-pointer"
            checked={shouldFetchLatest}
            onChange={(e) => {
              setShouldFetchLatest(e.target.checked);
              // only trigger search when there is a search term
              if (searchTerm) {
                fetchImages({
                  query: searchTerm,
                  color: selectedColor,
                  orderBy: e.target.checked ? "latest" : undefined,
                  page: 1,
                });
              }
            }}
          />
          <label htmlFor="latest" className="cursor-pointer">
            Sort by Latest
          </label>
        </span>
        {colors.map((color) => {
          const isSelectedColor = color === selectedColor;
          return (
            <button
              key={color}
              className={`shrink-0 bg-white rounded-xl px-2 py-[2px] ${
                isSelectedColor ? "outline outline-blue-600" : ""
              }`}
              onClick={() => {
                const newColor = isSelectedColor ? undefined : color;
                setSelectedColor(newColor);
                // only trigger search when there is a search term
                if (searchTerm) {
                  fetchImages({
                    query: searchTerm,
                    color: newColor,
                    orderBy: shouldFetchLatest ? "latest" : undefined,
                    page: 1,
                  });
                }
              }}
            >
              {color}
            </button>
          );
        })}
      </div>

      {/* RESULTS */}
      {results && !!results.length && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5">
          {results.map((res) => {
            return (
              <div
                key={res.id}
                className="aspect-square rounded-xl overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={res.description}
                  src={res.urls.regular}
                  className="object-cover h-full w-full"
                />
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && searchTerm && results && !results.length && (
        <span>No results found</span>
      )}
      {!isLoading && !searchTerm && !results && (
        <span>Enter search term to find images 😊</span>
      )}
      {isLoading && <span>Loading...</span>}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-5">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                fetchImages({
                  query: searchTerm,
                  color: selectedColor,
                  orderBy: shouldFetchLatest ? "latest" : undefined,
                  page: currentPage - 1,
                });
              }}
              className="disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-blue-600 text-white px-4 py-[2px]"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                fetchImages({
                  query: searchTerm,
                  color: selectedColor,
                  orderBy: shouldFetchLatest ? "latest" : undefined,
                  page: currentPage + 1,
                });
              }}
              className="disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-blue-600 text-white px-4 py-[2px]"
            >
              Next
            </button>
          </div>
          <span>{`${currentPage} / ${totalPages}`}</span>
        </div>
      )}
    </main>
  );
}
