import dayjs from 'dayjs';
import { type FC } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type OnChangeFn, type PaginationState, type ColumnDef } from '@tanstack/react-table';
import { SimulationStatus, type PaginatedSimulationList, type SimulationEntity } from '@fnli/types/simulations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlayedNumbers } from './PlayedNumbers';
import { SimulationStatusIcon } from '@/components/simulations/SimulationStatusIcon';
import { useRouter } from 'next/navigation';
import { numberFormat } from '@fnli/utils/numberFormat';

const simulationColumns: ColumnDef<SimulationEntity>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      return <div className="flex justify-center"><SimulationStatusIcon status={getValue<SimulationStatus>()} /></div>;
    },
  },
  {
    accessorKey: 'fixedNumbers',
    header: 'Played numbers',
    cell: ({ getValue }) => {
      return <PlayedNumbers numbers={getValue<SimulationEntity['fixedNumbers']>()} className="self-center" />
    },
  },
  {
    accessorKey: 'totalDraws',
    header: '# Draws',
    cell: ({ getValue }) => {
      return <p className="text-right">{numberFormat(getValue<number>())}</p>
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => {
      const created = dayjs(getValue<string>())
      return <p className="text-center">{created.format('YYYY.MM.DD.')}<br />{created.format('HH:mm:ss')}</p>
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Finished',
    cell: ({ getValue, row }) => {
      const updated = dayjs(getValue<string>())
      if (row.original.status !== '') {
        return <p className="text-center">-</p>
      }
      return <p className="text-center">{updated.format('YYYY.MM.DD.')}<br />{updated.format('HH:mm:ss')}</p>
    }
  },
];

export type SimulationsTableProps = Readonly<{
  simulations: PaginatedSimulationList;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>
}>

export const SimulationsTable: FC<SimulationsTableProps> = ({ simulations, pagination, onPaginationChange }) => {
  const table = useReactTable({
    data: simulations.data,
    columns: simulationColumns,
    getCoreRowModel: getCoreRowModel(),
    rowCount: simulations.total,
    onPaginationChange,
    manualPagination: true,
    state: { pagination },
  });

  const { push: goto } = useRouter();

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={header.id === "fixedNumbers" ? "" : "text-center"}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => goto(`simulations/${row.original.id}`)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={simulationColumns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={simulations.isFirst}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={simulations.isLast}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
