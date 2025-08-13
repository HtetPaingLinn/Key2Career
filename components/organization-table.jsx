"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export const schema = z.object({
  id: z.number(),
  image_url: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.string(),
  created_at: z.any().nullable(),
})

// Normalize various backend/user-entered status strings to canonical keys
export function normalizeStatus(status) {
  if (!status) return "unknown";
  const s = String(status).trim().toLowerCase();
  if (s.includes("ban")) return "banned";
  if (s === "verified" || s.includes("verify")) return "verified";
  if (
    s === "waiting for approvement" ||
    s === "waiting for approval" ||
    s.includes("wait") ||
    s.includes("pending") ||
    s.includes("approv")
  ) {
    return "waiting_for_approval";
  }
  return s;
}

// Sort helper shared by components
export function sortByCustomStatus(data, order) {
  // Build order map using normalized forms of provided order labels
  const orderMap = order.reduce((acc, statusLabel, index) => {
    acc[normalizeStatus(statusLabel)] = index;
    return acc;
  }, {});

  return [...data].sort((a, b) => {
    const aPos = orderMap[normalizeStatus(a.status)] ?? order.length;
    const bPos = orderMap[normalizeStatus(b.status)] ?? order.length;
    return aPos - bPos;
  });
}

// Create a separate component for the drag handle
function DragHandle({
  id
}) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent">
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns = [
  {
    id: "number",
    header: () => (
      <div className="ml-3">
        #
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center ml-2">
        <span className="text-sm font-medium text-muted-foreground">
          {row.index + 1}
        </span>
      </div>
    ),
    enableHiding: true,
  },
  {
    id: "profile",
    header: () => null,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={row.original.image_url} alt={row.original.name || "User"} />
          <AvatarFallback>
            {row.original.name ? row.original.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return row.original.name || "";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return row.original.email || "";
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const normalized = normalizeStatus(status);
      return (
        <Badge 
          variant={normalized === "waiting_for_approval" ? "secondary" : 
                  normalized === "verified" ? "default" : 
                  normalized === "banned" ? "destructive" : "secondary"}
          className={`capitalize ${
            normalized === "waiting_for_approval" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            normalized === "verified" ? "bg-green-100 text-green-800 border-green-200" :
            normalized === "banned" ? "bg-red-100 text-red-800 border-red-200" : ""
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const rawDate = row.original.created_at;
      if (!rawDate) return "N/A";
  
      const date = new Date(rawDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
      const year = date.getFullYear();
  
      return `${day}.${month}.${year}`;
    },
  },  
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row} />,
  },
]

function DraggableRow({
  row
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function RowActions({ row }) {
  const normalized = normalizeStatus(row.original.status);
  const [openAction, setOpenAction] = React.useState(null); // 'approve' | 'ban' | null
  const [confirmText, setConfirmText] = React.useState("");
  const [banReason, setBanReason] = React.useState("");
  const expectedText = openAction === 'approve' ? 'confirm approve' : 'confirm ban';
  const canConfirm = confirmText.trim().toLowerCase() === expectedText && (openAction === 'approve' || banReason.trim() !== '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleConfirm() {
    if (!canConfirm || !openAction) return;
    if (openAction === 'approve') {
      try {
        setIsSubmitting(true);
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          toast.error('Not authenticated. Please log in.', { className: 'text-base px-4 py-3' });
          return;
        }
        const email = row.original.email;
        const endpoint = `http://localhost:8080/api/admin/approveOrg?org_email=${encodeURIComponent(email)}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
        if (!res.ok) {
          const msg = `Approve failed (${res.status})`;
          toast.error(msg, { className: 'text-base px-4 py-3' });
          return;
        }
        toast.success('Organization Approved', { duration: 2000, className: 'text-base px-4 py-3' });
        setOpenAction(null);
        setConfirmText('');
        setBanReason('');
        // Refresh to reflect updated status
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        toast.error('Failed to approve organization', { className: 'text-base px-4 py-3' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (openAction === 'ban') {
      try {
        setIsSubmitting(true);
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          toast.error('Not authenticated. Please log in.', { className: 'text-base px-4 py-3' });
          return;
        }
        const email = row.original.email;
        const endpoint = `http://localhost:8080/api/admin/banOrg`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            org_email: email,
            reason: banReason,
          }),
        });
        if (!res.ok) {
          const msg = `Ban failed (${res.status})`;
          toast.error(msg, { className: 'text-base px-4 py-3 bg-red-100 text-red-800 border-red-200' });
          return;
        }
        toast.success('Organization Banned', { 
          duration: 2000, 
          className: 'text-base px-4 py-3 bg-red-100 text-red-800 border-red-200' 
        });
        setOpenAction(null);
        setConfirmText('');
        setBanReason('');
        // Refresh to reflect updated status
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        toast.error('Failed to ban organization', { 
          className: 'text-base px-4 py-3 bg-red-100 text-red-800 border-red-200' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {normalized === "verified" ? (
            <DropdownMenuItem disabled className="text-green-600">
              <IconCircleCheckFilled className="mr-2 h-4 w-4" />
              Verified
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => { setOpenAction('approve'); setConfirmText(''); setBanReason(''); }}>
              Approve
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="opacity-80" />
          <DropdownMenuItem variant="destructive" onClick={() => { setOpenAction('ban'); setConfirmText(''); setBanReason(''); }}>
            Ban
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!openAction} onOpenChange={(o) => { if (!o) { setOpenAction(null); setConfirmText(''); setBanReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {openAction === 'approve' ? 'Confirm Approve' : 'Confirm Ban'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {openAction === 'ban' && (
              <>
                <Label htmlFor="ban-reason">Reason for Ban</Label>
                <Input
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for ban"
                />
              </>
            )}
            <p className="text-sm text-muted-foreground">
              Type "{expectedText}" to proceed.
            </p>
            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpenAction(null); setConfirmText(''); setBanReason(''); }}>Cancel</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!canConfirm || isSubmitting} 
              className={openAction === 'ban' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isSubmitting ? <IconLoader className="animate-spin h-4 w-4" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusSortButton({ statusOrder, setStatusOrder, setData, data, clearSorting }) {
  const DEFAULT_ORDER = [
    "waiting_for_approval", // approval
    "verified",
    "banned"
  ];

  const [tempOrder, setTempOrder] = React.useState(statusOrder);

  function applySort() {
    setStatusOrder(tempOrder);
    const sorted = sortByCustomStatus(data, tempOrder);
    if (typeof clearSorting === "function") clearSorting();
    setData(sorted);
  }

  function moveStatus(fromIndex, toIndex) {
    const updated = [...tempOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTempOrder(updated);
  }

  function resetToDefault() {
    setTempOrder(DEFAULT_ORDER);
    setStatusOrder(DEFAULT_ORDER);
    const sorted = sortByCustomStatus(data, DEFAULT_ORDER);
    if (typeof clearSorting === "function") clearSorting();
    setData(sorted);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconChevronDown />
          Status Sort
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Preferred Status Order</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          {tempOrder.map((status, index) => (
            <div
              key={status}
              className="flex items-center justify-between border rounded px-3 py-1 bg-muted cursor-grab"
            >
              <span className="capitalize">{status}</span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => moveStatus(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === tempOrder.length - 1}
                  onClick={() => moveStatus(index, index + 1)}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={resetToDefault}>Reset</Button>
          <Button onClick={applySort}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationTable({ initialData = [] }) {
  const [data, setData] = React.useState([])
  const [statusOrder, setStatusOrder] = React.useState([
    "waiting_for_approval",
    "verified",
    "banned",
  ]);

  React.useEffect(() => {
    if (initialData.length) {
      const sorted = sortByCustomStatus(initialData, statusOrder);
      setData(sorted);
    }
  }, [initialData]);

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState({})
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data])

  // Calculate count of organizations waiting for approval
  const waitingForApprovalCount = React.useMemo(() => {
    return data.filter(item => normalizeStatus(item.status) === "waiting_for_approval").length;
  }, [data]);  

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex);
      })
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6 mt-6 mb-12">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList
          className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <StatusSortButton
            statusOrder={statusOrder}
            setStatusOrder={setStatusOrder}
            setData={setData}
            data={data}
            clearSorting={() => setSorting([])}
          />

          {/* <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button> */}

        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}>
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {waitingForApprovalCount} of {table.getFilteredRowModel().rows.length} organization(s) waiting for approval.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
    </>
  );
}