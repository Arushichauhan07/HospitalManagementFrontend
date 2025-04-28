import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/UI/Card"
import Button from "../components/UI/Button"
import Input from "../components/UI/Input"
import Label from "../components/UI/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/UI/Tabs"
import Badge  from "../components/UI/Badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/UI/Dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/UI/Table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/UI/Select"
import Progress from "../components/UI/Progress"
import { Plus, Search, Edit, Trash2, FileText, Download, Filter, MoreHorizontal, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/UI/DropMenu"
import { cn } from "../components/Lib/Utilis"
import { useGetInventoryQuery, useCreateInventoryMutation, useDeleteInventoryMutation, useUpdateInventoryMutation } from '../redux/slices/inventorySlice';
import { useSelector } from "react-redux"

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [inventoryItems, setInventoryItems] = useState([
    {
      itemName: '',
      category: '',
      quantity: 0,
      price: 0,
      supplier: '',
      unit: 'pieces',
      minStock: 0,
      status:'In stock'
    }
  ]);

  const { mode } = useSelector((state) => state.theme);
  const [updatedItem, setUpdatedItem] = useState({
    itemName: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    unit: 'pieces',
    minStock: 0,
    status: ''
  });
  
  // console.log("inventoryItems", inventoryItems)
  const { data: inventoryData, error, isLoading, isFetching, isSuccess } = useGetInventoryQuery();
  // Use the correct mutation hook for POST
  const [createInventory, { isLoading: isCreating, isSuccess: isCreated, isError: createError, error: createErr }] = useCreateInventoryMutation();
  const [deleteInventory] = useDeleteInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();

  // console.log( inventoryData?.data)
  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setInventoryItems((prevItems) => ({
      ...prevItems,
      [name]: value
    }));
  };


  const handleSubmitInventory = async (e) => {
    e.preventDefault();
    
    try {
      await createInventory(inventoryItems).unwrap();    // Call POST mutation
      setShowAddItem(false)

      setInventoryItems({ 
        itemName: '', 
        category: '', 
        quantity: 0, 
        price: 0, 
        supplier: '', 
        unit: 'pieces', 
        minStock: 0,
        status: ''
      });  // Reset form fields
    } catch (err) {
      // console.error('Failed to create inventory:', err);
      // alert('Failed to create inventory');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setUpdatedItem({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      supplier: item.supplier,
      unit: item.unit,
      minStock: item.minStock,
      status: item.status,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateInventory({ id: editId, updatedItem }).unwrap();
      // console.log('Item updated successfully');
      refetch();   // Refetch to refresh the list
      setEditId(null);
    } catch (error) {
      // console.error('Failed to update item:', error);
    }
  };

  const [items, setItems] = useState([
    {
      id: "MED-001",
      name: "Surgical Masks",
      category: "PPE",
      quantity: 2500,
      unit: "pieces",
      minStock: 500,
      location: "Storage A",
      lastRestocked: "Jan 2, 2025",
      status: "in-stock",
    },
    {
      id: "MED-002",
      name: "Disposable Gloves",
      category: "PPE",
      quantity: 1800,
      unit: "pairs",
      minStock: 300,
      location: "Storage A",
      lastRestocked: "Jan 3, 2025",
      status: "in-stock",
    },
    {
      id: "MED-003",
      name: "Surgical Scalpels",
      category: "Surgical Tools",
      quantity: 120,
      unit: "pieces",
      minStock: 50,
      location: "Storage B",
      lastRestocked: "Dec 28, 2024",
      status: "in-stock",
    },
    {
      id: "MED-004",
      name: "IV Solution Bags",
      category: "Medical Supplies",
      quantity: 350,
      unit: "bags",
      minStock: 100,
      location: "Storage C",
      lastRestocked: "Jan 1, 2025",
      status: "in-stock",
    },
    {
      id: "MED-005",
      name: "Bandages",
      category: "Medical Supplies",
      quantity: 80,
      unit: "boxes",
      minStock: 100,
      location: "Storage A",
      lastRestocked: "Dec 25, 2024",
      status: "low-stock",
    },
    {
      id: "MED-006",
      name: "Syringes",
      category: "Medical Supplies",
      quantity: 25,
      unit: "boxes",
      minStock: 50,
      location: "Storage B",
      lastRestocked: "Dec 20, 2024",
      status: "low-stock",
    },
    {
      id: "MED-007",
      name: "Surgical Gowns",
      category: "PPE",
      quantity: 0,
      unit: "pieces",
      minStock: 100,
      location: "Storage A",
      lastRestocked: "Dec 15, 2024",
      status: "out-of-stock",
    },
  ])
  // Sample data for inventory transactions
  // const [transactions, setTransactions] = useState([
  //   {
  //     id: "TRX-001",
  //     itemId: "MED-001",
  //     itemName: "Surgical Masks",
  //     type: "restock",
  //     quantity: 1000,
  //     date: "Jan 2, 2025",
  //     staff: "Ahmed Ibrahim",
  //     notes: "Regular monthly restock",
  //   },
  //   {
  //     id: "TRX-002",
  //     itemId: "MED-002",
  //     itemName: "Disposable Gloves",
  //     type: "restock",
  //     quantity: 500,
  //     date: "Jan 3, 2025",
  //     staff: "Layla Mahmoud",
  //     notes: "Emergency restock due to increased demand",
  //   },
  //   {
  //     id: "TRX-003",
  //     itemId: "MED-001",
  //     itemName: "Surgical Masks",
  //     type: "usage",
  //     quantity: 200,
  //     date: "Jan 3, 2025",
  //     staff: "Omar Hassan",
  //     notes: "Used for emergency department",
  //   },
  //   {
  //     id: "TRX-004",
  //     itemId: "MED-003",
  //     itemName: "Surgical Scalpels",
  //     type: "usage",
  //     quantity: 15,
  //     date: "Jan 4, 2025",
  //     staff: "Dr. Sara Hassan",
  //     notes: "Used for surgeries",
  //   },
  //   {
  //     id: "TRX-005",
  //     itemId: "MED-005",
  //     itemName: "Bandages",
  //     type: "usage",
  //     quantity: 10,
  //     date: "Jan 4, 2025",
  //     staff: "Nour Ahmed",
  //     notes: "Used for emergency department",
  //   },
  // ])

  // Filter items based on search query
  const filteredItems = inventoryData?.data.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inventoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter transactions based on search query
  // const filteredTransactions = transactions.filter(
  //   (transaction) =>
  //     transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     transaction.type.toLowerCase().includes(searchQuery.toLowerCase()),
  // )

  // Add new item
  // const handleAddItem = (newItem) => {
  //   const id = `MED-${(items.length + 1).toString().padStart(3, "0")}`
  //   const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  //   const status =
  //     newItem.quantity <= 0 ? "out-of-stock" : newItem.quantity < newItem.minStock ? "low-stock" : "in-stock"

  //   setItems([
  //     ...items,
  //     {
  //       ...newItem,
  //       id,
  //       lastRestocked: today,
  //       status,
  //     },
  //   ])
  //   setShowAddItem(false)
  // }

  // Update item
  const handleUpdateItem = (updatedItem) => {
    const status =
      updatedItem.quantity <= 0
        ? "out-of-stock"
        : updatedItem.quantity < updatedItem.minStock
          ? "low-stock"
          : "in-stock"

    updatedItem.status = status

    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setSelectedItem(null)
  }

  // Delete item
  const handleDelete = async (id) => {
      try {
        await deleteInventory(id).unwrap();
        // console.log('Item deleted successfully');
        refetch();   //  Refetch to refresh the list
      } catch (error) {
        // console.error('Failed to delete item:', error);
      }
  };

  // Add new transaction
  // const handleAddTransaction = (newTransaction) => {
  //   const id = `TRX-${(transactions.length + 1).toString().padStart(3, "0")}`
  //   const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  //   // Find the item
  //   const item = items.find((item) => item.id === newTransaction.itemId)

  //   // Create the transaction
  //   const transaction = {
  //     ...newTransaction,
  //     id,
  //     date: today,
  //     itemName: item ? item.name : "",
  //   }

  //   // Update the item quantity
  //   if (item) {
  //     const updatedItem = { ...item }

  //     if (transaction.type === "restock") {
  //       updatedItem.quantity += Number.parseInt(transaction.quantity)
  //       updatedItem.lastRestocked = today
  //     } else if (transaction.type === "usage") {
  //       updatedItem.quantity = Math.max(0, updatedItem.quantity - Number.parseInt(transaction.quantity))
  //     }

  //     // Update item status
  //     updatedItem.status =
  //       updatedItem.quantity <= 0
  //         ? "out-of-stock"
  //         : updatedItem.quantity < updatedItem.minStock
  //           ? "low-stock"
  //           : "in-stock"

  //     // Update items
  //     handleUpdateItem(updatedItem)
  //   }

  //   // Add transaction
  //   setTransactions([transaction, ...transactions])
  //   setShowAddTransaction(false)
  // }

  return (
    <>
    <div className="p-2">
      <div className="flex items-center justify-between mb-6 m-4">
        <h1 className="text-2xl font-bold">Medical Inventory</h1>
        <div className="flex gap-2 flex-col md:flex-row">
          {/* <Button className="bg-[#0fb3af] hover:bg-teal-600" onClick={() => setShowAddTransaction(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Record Transaction
          </Button> */}
          <Button className="bg-[#0fb3af] hover:bg-teal-600" onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
          <Input
            type="search"
            placeholder="Search inventory items or transactions..."
            className="pl-8 w-full border-2 border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Button variant="outline" size="icon" className="ml-2 hover:bg-teal-100">
          <Filter className="h-4 w-4" />
        </Button> */}
        <Button variant="outline" size="sm" className="ml-2 hover:bg-teal-100">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Low Stock Alert */}
      {inventoryData?.data.some((item) => item.status === "low-stock" || item.status === "out-of-stock") && (
        <div className="mb-6 border border-amber-500 rounded-lg">
          <div className="p-4 flex items-start gap-3">
            <div className="bg-amber-100 text-amber-800 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Low Stock Alert</h3>
              <p className="text-sm text-muted-foreground">
                {inventoryData?.data.filter((item) => item.status === "low-stock").length} items are running low and{" "}
                {inventoryData?.data.filter((item) => item.status === "out-of-stock").length} items are out of stock. Please restock
                soon.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="inventory" className="mb-6">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Inventory Items
          </TabsTrigger>
          {/* <TabsTrigger value="transactions" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Transactions
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <div className="border border-gray-200 rounded-lg">
            <div className="pb-2 flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none">Inventory Overview</div>
              <div className="text-sm text-gray-500">Current stock levels and inventory status</div>
            </div>
            <div className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead>Location</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.inventoryId}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-xs text-muted-foreground">Min: {item?.minStock}</span>
                          </div>
                          <Progress
                            value={Math.min(100, (item?.quantity / item?.minStock) * 100)}
                            className={`
                              "h-2",
                              ${item?.status === "out-of-stock"
                                ? "bg-rose-500"
                                : item?.status === "low-stock"
                                  ? "bg-amber-500"
                                  : "bg-teal-500"}
                            `}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            item?.status === "in-stock"
                            ? mode === "dark"
                              ? "bg-green-900 text-green-300"
                              : "bg-green-100 text-green-800"
                            : item?.status === "low-stock"
                              ? mode === "dark"
                                ? "bg-amber-900 text-amber-300"
                                : "bg-amber-100 text-amber-800"
                              : mode === "dark"
                                ? "bg-rose-900 text-rose-300"
                                : "bg-rose-100 text-rose-800"
                          )}
                        >
                          {item?.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>{item?.location}</TableCell> */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setShowAddTransaction(true)
                                // Pre-select this item for restock
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Record Transaction
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Recent inventory additions and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.itemName}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            transaction.type === "restock"
                              ? mode === "dark"
                                ? "bg-green-900 text-green-300"
                                : "bg-green-100 text-green-800"
                              : mode === "dark"
                                ? "bg-blue-900 text-blue-300"
                                : "bg-blue-100 text-blue-800"
                            )}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.staff}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{transaction.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">Add Inventory Item</DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        Enter the details of the new inventory item.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmitInventory} className="space-y-6">
      {[
        { label: "Name", name: "itemName", type: "text" },
        { label: "Quantity", name: "quantity", type: "number", min: 0 },
        { label: "Price", name: "price", type: "number", min: 0 },
        { label: "Supplier", name: "supplier", type: "text" },
        { label: "Min Stock", name: "minStock", type: "number", min: 0 },
      ].map(({ label, name, type, min }) => (
        <div key={name} className="grid grid-cols-4 items-center gap-4">
          <label htmlFor={name} className="text-right font-medium">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            value={inventoryItems[name]}
            onChange={handleOnChange}
            min={min}
            required
            className="col-span-3 rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      ))}

      {[
        {
          label: "Category",
          name: "category",
          options: ["", "PPE", "Medical Supplies", "Surgical Tools"],
        },
        {
          label: "Unit",
          name: "unit",
          options: ["pieces", "boxes", "pairs", "bags", "vials"],
        },
        {
          label: "Status",
          name: "status",
          options: ["In stock", "Low Stock", "Out of Stock"],
        },
      ].map(({ label, name, options }) => (
        <div key={name} className="grid grid-cols-4 items-center gap-4">
          <label htmlFor={name} className="text-right font-medium">
            {label}
          </label>
          <select
            id={name}
            name={name}
            value={inventoryItems[name]}
            onChange={handleOnChange}
            required
            className="col-span-3 rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "" ? "Select " + label.toLowerCase() : opt}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-teal-500 px-5 py-2 text-white shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "Add Item"}
        </button>
      </div>
    </form>
  </DialogContent>
</Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update the details of the inventory item.</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input 
                  id="edit-name" 
                  name="name" defaultValue={selectedItem.name} 
                  onChange={(e) => setUpdatedItem({ ...updatedItem, itemName: e.target.value })}
                  className="col-span-3" required
                   />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select name="category" defaultValue={selectedItem.category} onChange={(e) => setUpdatedItem({ ...updatedItem, itemName: e.target.value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PPE">PPE</SelectItem>
                      <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                      <SelectItem value="Surgical Tools">Surgical Tools</SelectItem>
                      <SelectItem value="Medications">Medications</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    defaultValue={selectedItem.quantity}
                    className="col-span-3"
                    onChange={(e) => setUpdatedItem({ ...updatedItem, itemName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit" className="text-right">
                    Unit
                  </Label>
                  <Select name="unit" defaultValue={selectedItem.unit} onChange={(e) => setUpdatedItem({ ...updatedItem, itemName: e.target.value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="pairs">Pairs</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="vials">Vials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-minStock" className="text-right">
                    Min Stock
                  </Label>
                  <Input
                    id="edit-minStock"
                    name="minStock"
                    type="number"
                    min="0"
                    defaultValue={selectedItem.minStock}
                    className="col-span-3"
                    required
                    onChange={(e) => setUpdatedItem({ ...updatedItem, itemName: e.target.value })}
                  />
                </div>
                {/* <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Location
                  </Label>
                  <Select name="location" defaultValue={selectedItem.location}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Storage A">Storage A</SelectItem>
                      <SelectItem value="Storage B">Storage B</SelectItem>
                      <SelectItem value="Storage C">Storage C</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Emergency Dept">Emergency Dept</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Item
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      {/* <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Inventory Transaction</DialogTitle>
            <DialogDescription>Record a new inventory transaction (restock or usage).</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const newTransaction = {
                itemId: formData.get("itemId"),
                type: formData.get("type"),
                quantity: Number.parseInt(formData.get("quantity")),
                staff: formData.get("staff"),
                notes: formData.get("notes") || "",
              }
              handleAddTransaction(newTransaction)
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemId" className="text-right">
                  Item
                </Label>
                <Select name="itemId" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select name="type" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Restock</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input id="quantity" name="quantity" type="number" min="1" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff" className="text-right">
                  Staff
                </Label>
                <Input id="staff" name="staff" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input id="notes" name="notes" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTransaction(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Record Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog> */}
    </>
  )
}

