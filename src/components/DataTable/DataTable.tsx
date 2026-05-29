import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import clsx from 'clsx';

type Column<T> = {
  id: string;
  header?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId?: (row: T, idx: number) => string | number;
  getRowClassName?: (row: T, idx: number) => string | undefined;
  className?: string;
  tableClassName?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  getRowClassName,
  className,
  tableClassName,
}: Props<T>) {
  return (
    <TableContainer className={clsx('overflow-x-auto overflow-y-visible pb-4', className)}>
      <Table className={clsx('w-full text-sm text-left', tableClassName)}>
        <TableHead className="text-xs text-stone-500 uppercase bg-stone-50">
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                className={col.headerClassName}
                sx={{ width: col.width, verticalAlign: 'middle' }}
              >
                {col.header ?? ''}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={getRowId ? getRowId(row, idx) : idx}
              className={clsx('border-b border-stone-100 last:border-0', getRowClassName?.(row, idx))}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  className={col.cellClassName}
                  sx={{ verticalAlign: 'middle' }}
                >
                  {col.render ? col.render(row) : (row as any)[col.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
