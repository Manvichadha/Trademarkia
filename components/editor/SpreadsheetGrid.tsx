"use client";

import { Virtuoso } from "react-virtuoso";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { Cell } from "./Cell";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";

const ROWS = 100;
const COLS = 26;
const COL_WIDTH = 100;
const ROW_HEIGHT = 28;
const HEADER_WIDTH = 48;

interface SpreadsheetGridProps {
  updatedBy: string;
}

const COL_LABELS = Array.from({ length: COLS }, (_, i) =>
  toCellId({ row: 0, col: i }).replace(/\d+/, "")
);

export function SpreadsheetGrid({ updatedBy }: SpreadsheetGridProps) {
  return (
    <div className="flex flex-col overflow-auto rounded-lg border border-border-subtle bg-surface-1">
      {/* Column headers */}
      <div className="flex shrink-0">
        <div
          className="border-b border-r border-border-subtle bg-surface-2"
          style={{ width: HEADER_WIDTH, minHeight: ROW_HEIGHT }}
        />
        <div className="flex">
          {COL_LABELS.map((_, col) => (
            <ColumnHeader key={col} col={col} width={COL_WIDTH} />
          ))}
        </div>
      </div>

      {/* Rows with virtual scrolling */}
      <div className="flex-1" style={{ height: "70vh" }}>
        <Virtuoso
          style={{ height: "100%" }}
          totalCount={ROWS}
          overscan={ROW_HEIGHT * 12}
          itemContent={(row) => (
            <div className="flex" style={{ height: ROW_HEIGHT }}>
              <RowHeader row={row} height={ROW_HEIGHT} />
              <div className="flex">
                {Array.from({ length: COLS }, (_, col) => (
                  <Cell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    updatedBy={updatedBy}
                  />
                ))}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
