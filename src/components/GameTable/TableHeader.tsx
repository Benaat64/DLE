import { Column } from "./types";

interface TableHeaderProps {
  columns: Column[];
}

function TableHeader({ columns }: TableHeaderProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] bg-gray-800 text-white font-bold">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`p-2 ${
            column.align === "right"
              ? "text-right"
              : column.align === "center"
              ? "text-center"
              : "text-left"
          }`}
          style={{ width: column.width }}
        >
          {column.title}
        </div>
      ))}
    </div>
  );
}

export default TableHeader;
