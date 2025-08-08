"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { CreateEventContextData, CreateEventSheet } from "./create-event-sheet"
import { Event } from "@/lib/data/event"
import { Member } from "@/lib/data/member"
import { DateFormat, DateTimeFormat } from "../datetime-format"

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "name",
    header: "Event name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "attendee_data",
    header: () => <div>Attendees</div>,
    cell: ({ row }) => {
      const attendees = (row.getValue("attendee_data") || []) as Member[]
      return <div>{attendees.length || 0}</div>
    },
  },
  {
    accessorKey: "attendance_open_from",
    header: () => <div>Accepting responses</div>,
    cell: ({ row }) => {
      const from = row.getValue("attendance_open_from") as string
      const until = row.original.attendance_open_until as string

      if (from && until) {
        const fromDate = new Date(from as string)
        const untilDate = new Date(until as string)
        const now = new Date()

        if (fromDate < now && untilDate > now) {
          return <div className="text-primary font-medium">Open until <DateTimeFormat date={until} connective=" / " /></div>
        }
      }

      return <div className="text-muted-foreground">Closed</div>
    },
  },
  {
    accessorKey: "event_start",
    header: () => <div>Event start</div>,
    cell: ({ row }) => {
      return (
        <DateTimeFormat
          date={row.getValue("event_start") as string}
          connective=" / "
        />
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div>Created</div>,
    cell: ({ row }) => {
      return (
        <DateFormat
          date={row.getValue("created_at") as string}
        />
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const event = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href={`/event/${event.id}`}>Manage event</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Delete event</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function EventTable({ data, contextData }: { data: Event[], contextData: CreateEventContextData }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 justify-between pb-4">
        <Input
          placeholder="Filter event names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <CreateEventSheet trigger={<Button variant="outline">Create New</Button>} contextData={contextData} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Total {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
