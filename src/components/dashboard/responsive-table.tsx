import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CardContent, Card } from '@/components/ui/card';

interface DataItem {
  [key: string]: any;
}

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: any) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveDataTableProps {
  data: DataItem[];
  columns: Column[];
  emptyMessage?: string;
}

export function ResponsiveDataTable({
  data,
  columns,
  emptyMessage = "Nenhum dado encontrado",
}: ResponsiveDataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Versão para desktop
  const DesktopTable = () => (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell key={`${i}-${column.accessorKey}`} className={column.className}>
                  {column.cell
                    ? column.cell(item)
                    : item[column.accessorKey]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Versão para mobile
  const MobileCards = () => (
    <div className="grid gap-4 md:hidden">
      {data.map((item, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <div key={column.accessorKey} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-medium text-sm text-muted-foreground">
                    {column.header}
                  </span>
                  <div className="text-right">
                    {column.cell
                      ? column.cell(item)
                      : item[column.accessorKey]
                    }
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <DesktopTable />
      <MobileCards />
    </>
  );
}
