import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/UI/Card"
import Button from "../components/UI/Button"
import Input from "../components/UI/Input"
import Label from "../components/UI/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/UI/Tabs"
import Badge from "../components/UI/Badge"
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
import { Plus, Search, Edit, Trash2, FileText, Download, Filter, MoreHorizontal, AlertTriangle, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/UI/DropMenu"
import { cn } from "../components/Lib/Utilis"
import { useChangeFilledStatusMutation, useGetAllPrescriptionsQuery } from "../redux/slices/prescriptionSlice"
import { useGetInventoryQuery, useUpdateInventoryMutation } from "../redux/slices/inventorySlice"
import axios from "axios"

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showAddPrescription, setShowAddPrescription] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [prescriptions, setPrescriptions] = useState()
  const { data, isLoading, isError } = useGetAllPrescriptionsQuery()
  const [changeFilledStatus] = useChangeFilledStatusMutation()
  const [updateInventory] = useUpdateInventoryMutation();
  const { data: inventoryData, isLoading: inventoryIsLoading } = useGetInventoryQuery();
  // console.log("prescriptions", data)
  // Sample data for medications
  const [medications, setMedications] = useState()
  const [newMed, setNewMed] = useState("");
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicationId, setSelectedMedicationid] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fill prescription
  const handleFillPrescription = async (_id) => {
    // console.log("id", _id);

    const prescription = prescriptions.find((p) => p._id === _id);
    // console.log("prescription", prescription);

    if (!prescription || prescription.filled) return;

    try {
      // Loop through each medication in the prescription array
      for (const med of prescription.prescription) {
        const medication = filteredMedications?.find((m) => {
          // console.log("m.itemName", m.itemName, "med.medicineName", med.medicineName);
          return m.itemName.toLowerCase() === med.medicineName.toLowerCase();
        });

        // console.log("medication", medication, "med", med);

        if (medication) {
          const updatedQuantity = Math.max(0, medication.quantity - med.quantity); // if dosage is being used as quantity

          const updatedMedication = {
            ...medication,
            quantity: updatedQuantity,
            status:
              updatedQuantity <= 0
                ? "Out of Stock"
                : updatedQuantity < medication.minStock
                  ? "Low Stock"
                  : "In Stock",
          };
          // console.log("updatedMedication", updatedMedication);

          await updateInventory({
            id: medication._id,
            updatedItem: updatedMedication,
          });
        }
      }

      // console.log("Inventory updated");

      // Update the prescription filled status
      await changeFilledStatus({ id: _id });

    } catch (error) {
      // console.error("Error filling prescription:", error);
    }
  };

  useEffect(() => {
    if (inventoryData) {
      // console.log("inventoryData", inventoryData.data)
      setMedications(inventoryData.data?.filter((item) => item.category !== "Surgical Tools"));
    }
  }, [inventoryData])

  useEffect(() => {
    if (data) {
      // console.log("prescriptions", data.data)
      setPrescriptions(data.data)
    }
  }, [data, handleFillPrescription])

  // Filter medications based on search query
  const filteredMedications = medications?.filter(
    (med) =>
      med._id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      med.itemName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      med.inventoryId?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      med.category?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )
  // console.log("filteredMedications", filteredMedications, "medications", medications)

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions?.filter(
    (prescription) =>
      prescription?.patient_id?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      prescription?.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      prescription?.doctor?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      prescription?.patient_id?.medicalHistory?.some((med) => med.name?.toLowerCase().includes(searchQuery?.toLowerCase())),
  )
  // console.log("filteredPrescriptions", filteredPrescriptions, "prescriptions", prescriptions)

  // Add new medication
  const handleAddMedication = (newMedication) => {
    const id = `MED-${(medications.length + 1).toString().padStart(3, "0")}`

    const status =
      newMedication.quantity <= 0
        ? "Out of Stock"
        : newMedication.quantity < newMedication.minStock
          ? "Low Stock"
          : "In Stock"

    setMedications([
      ...medications,
      {
        ...newMedication,
        id,
        status,
      },
    ])
    setShowAddMedication(false)
  }

  // Update medication
  const handleUpdateMedication = (updatedMedication) => {
    const status =
      updatedMedication.quantity <= 0
        ? "Out of Stock"
        : updatedMedication.quantity < updatedMedication.minStock
          ? "Low Stock"
          : "In Stock"

    updatedMedication.status = status

    setMedications(medications?.map((med) => (med.id === updatedMedication.id ? updatedMedication : med)))
    setSelectedMedication(null)
  }

  // Delete medication
  const handleDeleteMedication = (id) => {
    setMedications(medications?.filter((med) => med.id !== id))
  }

  // Add new prescription
  const handleAddPrescription = (newPrescription) => {
    const id = `PRE-${(prescriptions.length + 1).toString().padStart(3, "0")}`
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    setPrescriptions([
      ...prescriptions,
      {
        ...newPrescription,
        id,
        date: today,
        status: "pending",
      },
    ])
    setShowAddPrescription(false)
  }

  const checkInteractions = async () => {
    if (medications.length < 2) return;
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/gen-ai-rotes/checkDrugInteractions`, {
        medications: selectedMedicationId.map((m) => m.name),
      });
      // console.log("interactions", response.data);

      setInteractions(response.data.interactions || []);
    } catch (error) {
      // console.error("Error checking interactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Automatically check when meds change
  useEffect(() => {
    checkInteractions();
  }, [selectedMedicationId]);


  const addMedication = () => {
    if (!newMed.trim()) return;
    setSelectedMedicationid([...selectedMedicationId, { name: newMed.trim(), dosage: "Unspecified" }]);
    setNewMed("");
  };

  const removeMedication = (index) => {
    const updated = [...selectedMedicationId];
    updated.splice(index, 1);
    setSelectedMedicationid(updated);
  };

  const handlePrescriptionSelect = (id) => {
    setSelectedPrescriptionId(id);
    const selected = filteredPrescriptions.find(p => p._id === id);
    if (!selected) return;

    const meds = selected.prescription.map(med => ({
      name: med.medicineName,
      dosage: med.dosage,
      duration: med.duration,
      instructions: med.instructions,
    }));

    setSelectedMedicationid(meds); // auto-fill
  };

  return (
    <>
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pharmacy Management</h1>
        <div className="flex gap-2 md:flex-row flex-col">
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddPrescription(true)}>
            <FileText className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddMedication(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medications or prescriptions..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="ml-2">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="ml-2">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Add medication interaction checker and improve mobile responsiveness */}



      {/* Add a new medication interaction checker feature */}
      <div className="mb-6">
        <Card className="border-teal-500 dark:border-teal-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Medication Interaction Checker</CardTitle>
                <CardDescription>Verify potential drug interactions before dispensing</CardDescription>
              </div>
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">New</Badge>
            </div>
          </CardHeader>
          <CardContent >
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {/* Left Side - Medications */}
              <div>
                <div className="mb-4">
                  <Label>Select Prescription</Label>
                  <Select onValueChange={handlePrescriptionSelect}>
                    <SelectTrigger className="w-full border-2 p-2 rounded-md">
                      <SelectValue placeholder="Choose a prescription" />
                    </SelectTrigger>
                    <SelectContent className='w-full backdrop-blur-3xl'>
                      {filteredPrescriptions?.map((pres, i) => (
                        <SelectItem key={pres._id} value={pres._id}>
                          {pres.id} - {pres.doctor?.name} ({new Date(pres.consultationDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>

                  <Label>Current Medications</Label>
                  <div className="border rounded-md p-3 mt-1 min-h-[100px] max-h-[200px] overflow-y-auto space-y-2">
                    {selectedMedicationId?.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                      >
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Input
                      value={newMed}
                      onChange={(e) => setNewMed(e.target.value)}
                      placeholder="Enter medication name"
                    />
                    <Button onClick={addMedication} className="bg-teal-500 hover:bg-teal-600">
                      Add
                    </Button>
                  </div>
                </div>
              </div>


              {/* Right Side - Interaction Analysis */}
              <div>
                <h3 className="font-medium mb-2">Interaction Analysis</h3>
                {loading ? (
                  <p>Loading analysis...</p>
                ) : interactions.length === 0 ? (
                  <p className="text-muted-foreground">No interactions found or not enough medications.</p>
                ) : (
                  <div className="space-y-4">
                    {interactions.map((item, i) => (
                      <div
                        key={i}
                        className="border rounded-md p-3 bg-amber-50 border-amber-200 "
                      >
                        <h4 className="font-medium">{item.medicationsInvolved}</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                        <p className="text-sm font-medium mt-1 text-amber-600 dark:text-amber-400">
                          Severity: {item.severity}
                        </p>
                        <p className="text-sm">Recommendation: {item.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
                {interactions && <div className="mt-6">
                  <h3 className="font-medium mb-2">Alternative Medications</h3>
                  {interactions.map((item, i) => (
                    <div key={i} className="">
                      {(item.alternatives || []).map((altGroup, j) => (
                        <div key={j} className="p-2 mt-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Alternatives to {altGroup.original}</p>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Suggested
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{altGroup.alternatives.join(", ")}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>}
              </div>


            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {medications?.some((med) => med.status === "Low Stock" || med.status === "Out of Stock") && (
        <Card className="mb-6 border-amber-500 dark:border-amber-700">
          <CardContent className="p-4 pt-4 align-items-center  flex items-start gap-3">
            <div className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Low Medication Alert</h3>
              <p className="text-sm text-muted-foreground">
                {medications?.filter((med) => med.status === "Low Stock").length} medications are running low and{" "}
                {medications?.filter((med) => med.status === "Out of Stock").length} medications are out of stock. Please
                restock soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <div className="flex items-center justify-end mb-6">
          <div className="relative flex-1 text-center  items-center rounded-lg p-1 max-w-sm border">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medications or prescriptions..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="ml-2">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

      </div>
      </div>
      <Tabs defaultValue="medications" className="mb-6">
        <TabsList className="bg-teal-100 dark:bg-teal-900">
          <TabsTrigger value="medications" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Medication Inventory
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Medication Inventory</CardTitle>
              <CardDescription>Current pharmacy inventory status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Dosage/Form</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications?.map((med) => (
                    <TableRow key={med?._id}>
                      <TableCell className="font-medium">{med?.inventoryId}</TableCell>
                      <TableCell>{med?.itemName}</TableCell>
                      <TableCell>{med?.category}</TableCell>
                      <TableCell>
                        {med?.dosage} {med?.form}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <Badge
                              className={cn(
                                med.status === "In Stock"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : med.status === "Low Stock"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
                              )}
                            >
                              {med?.quantity} {med?.unit}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Min: {med?.minStock}</span>
                          </div>
                          <Progress
                            value={Math.min(100, (med?.quantity / med?.minStock) * 100)}
                            className={cn(
                              "h-2",
                              med?.status === "Out of Stock"
                                ? "bg-rose-500"
                                : med?.status === "Low Stock"
                                  ? "bg-amber-500"
                                  : "bg-teal-500",
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{med?.expiryDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedMedication(med)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteMedication(med.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Prescription Requests</CardTitle>
              <CardDescription>Pending and recent prescription requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredPrescriptions?.map((prescription) => (
                  <Card
                    key={prescription._id}
                    className={cn(
                      "overflow-hidden",
                      prescription.status === "pending" && "border-amber-500 dark:border-amber-700",
                    )}
                  >
                    <CardHeader className="bg-muted/30 pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {prescription.id}
                            <Badge
                              className={cn(
                                (prescription.filled) ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                              )}
                            >
                              {prescription.filled ? "Filled" : "Pending"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{prescription?.date?.split("T")[0]}</CardDescription>
                        </div>
                        {!prescription.filled && (
                          <Button
                            className="bg-teal-500 hover:bg-teal-600"
                            onClick={() => handleFillPrescription(prescription._id)}
                          >
                            Fill Prescription
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="text-sm font-medium mb-1">Patient Information</h3>
                          <p className="text-sm">{prescription?.patient_id?.name}</p>
                          <p className="text-xs text-muted-foreground">{prescription?.patient_id?.id}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Prescribed By</h3>
                          <p className="text-sm">{prescription?.doctor?.name}</p>
                          <p className="text-sm">{prescription?.doctor?.id}</p>
                        </div>
                      </div>

                      <h3 className="text-sm font-medium mb-2">Medications</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Instructions</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescription.prescription?.map((med, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{med.medicineName}</TableCell>
                              <TableCell>{med.dosage}</TableCell>
                              <TableCell>{med.frequency}</TableCell>
                              <TableCell>{med.instructions}</TableCell>
                              <TableCell>{med.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>Enter the details of the new medication.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const newMedication = {
                name: formData.get("name"),
                category: formData.get("category"),
                dosage: formData.get("dosage"),
                form: formData.get("form"),
                quantity: Number.parseInt(formData.get("quantity")),
                minStock: Number.parseInt(formData.get("minStock")),
                expiryDate: formData.get("expiryDate"),
                manufacturer: formData.get("manufacturer"),
              }
              handleAddMedication(newMedication)
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select name="category" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                    <SelectItem value="Analgesic">Analgesic</SelectItem>
                    <SelectItem value="NSAID">NSAID</SelectItem>
                    <SelectItem value="PPI">PPI</SelectItem>
                    <SelectItem value="Bronchodilator">Bronchodilator</SelectItem>
                    <SelectItem value="Hormone">Hormone</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  Dosage
                </Label>
                <Input id="dosage" name="dosage" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="form" className="text-right">
                  Form
                </Label>
                <Select name="form" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Inhaler">Inhaler</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input id="quantity" name="quantity" type="number" min="0" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minStock" className="text-right">
                  Min Stock
                </Label>
                <Input id="minStock" name="minStock" type="number" min="0" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiryDate" className="text-right">
                  Expiry Date
                </Label>
                <Input id="expiryDate" name="expiryDate" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manufacturer" className="text-right">
                  Manufacturer
                </Label>
                <Input id="manufacturer" name="manufacturer" className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddMedication(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Add Medication
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Dialog */}
      <Dialog open={!!selectedMedication} onOpenChange={(open) => !open && setSelectedMedication(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>Update the details of the medication.</DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updatedMedication = {
                  ...selectedMedication,
                  name: formData.get("name"),
                  category: formData.get("category"),
                  dosage: formData.get("dosage"),
                  form: formData.get("form"),
                  quantity: Number.parseInt(formData.get("quantity")),
                  minStock: Number.parseInt(formData.get("minStock")),
                  expiryDate: formData.get("expiryDate"),
                  manufacturer: formData.get("manufacturer"),
                }
                handleUpdateMedication(updatedMedication)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={selectedMedication.name}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select name="category" defaultValue={selectedMedication.category}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                      <SelectItem value="Analgesic">Analgesic</SelectItem>
                      <SelectItem value="NSAID">NSAID</SelectItem>
                      <SelectItem value="PPI">PPI</SelectItem>
                      <SelectItem value="Bronchodilator">Bronchodilator</SelectItem>
                      <SelectItem value="Hormone">Hormone</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-dosage" className="text-right">
                    Dosage
                  </Label>
                  <Input
                    id="edit-dosage"
                    name="dosage"
                    defaultValue={selectedMedication.dosage}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-form" className="text-right">
                    Form
                  </Label>
                  <Select name="form" defaultValue={selectedMedication.form}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                      <SelectItem value="Cream">Cream</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
                    defaultValue={selectedMedication.quantity}
                    className="col-span-3"
                    required
                  />
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
                    defaultValue={selectedMedication.minStock}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-expiryDate" className="text-right">
                    Expiry Date
                  </Label>
                  <Input
                    id="edit-expiryDate"
                    name="expiryDate"
                    defaultValue={selectedMedication.expiryDate}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-manufacturer" className="text-right">
                    Manufacturer
                  </Label>
                  <Input
                    id="edit-manufacturer"
                    name="manufacturer"
                    defaultValue={selectedMedication.manufacturer}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedMedication(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Medication
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogDescription>Enter the details of the new prescription.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)

              // Get medication details
              const medicationId = formData.get("medicationId")
              const medication = medications.find((m) => m.id === medicationId)

              const newPrescription = {
                patientName: formData.get("patientName"),
                patientId: formData.get("patientId"),
                doctor: formData.get("doctor"),
                medications: [
                  {
                    id: medicationId,
                    name: medication ? medication.name : "",
                    dosage: medication ? medication.dosage : "",
                    quantity: Number.parseInt(formData.get("quantity")),
                    instructions: formData.get("instructions"),
                  },
                ],
              }
              handleAddPrescription(newPrescription)
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientName" className="text-right">
                  Patient Name
                </Label>
                <Input id="patientName" name="patientName" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientId" className="text-right">
                  Patient ID
                </Label>
                <Input id="patientId" name="patientId" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor" className="text-right">
                  Doctor
                </Label>
                <Input id="doctor" name="doctor" className="col-span-3" required />
              </div>

              <div className="border-t my-2"></div>
              <h3 className="font-medium">Medication Details</h3>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicationId" className="text-right">
                  Medication
                </Label>
                <Select name="medicationId" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications
                      ?.filter((m) => m.status !== "Out of Stock")
                      ?.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} ({med.dosage} {med.form})
                        </SelectItem>
                      ))}
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
                <Label htmlFor="instructions" className="text-right">
                  Instructions
                </Label>
                <Input id="instructions" name="instructions" className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddPrescription(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Add Prescription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

