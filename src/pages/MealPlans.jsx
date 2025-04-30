import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/UI/Card"
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
import { Plus, Search, Edit, Trash2, FileText, DollarSign, Calendar, Clock, AlertCircle } from "lucide-react"
// import Checkbox from "../components/UI/Checkbox"
import {
  useGetMealPlansQuery,
  useGetPatientMealQuery,
  useCreateMealPlanMutation,
  useDeleteMealPlanMutation,
  useEditMealPlanMutation,
  useEditAssignMealPlanMutation,
  useCreatePatientMealMutation,
  useDeleteAssignMealPlanMutation
} from '../redux/slices/mealPlanSlice';
import { useGetPatientsQuery } from '../redux/slices/patientSlice'
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import {socket} from "../components/hooks/useInitSocket";
import { useCreateNotificationsMutation } from "../redux/slices/notificationSlice";
import { useFetchLoggedInUserQuery } from "../redux/slices/authSlice"
import { useSelector } from "react-redux";

export default function MealPlans() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchBillTerm, setSearchBillTerm] = useState("")
  const [showAddMealPlan, setShowAddMealPlan] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const { data: mealPlans, isLoading, error } = useGetMealPlansQuery();
  const { data: patientData } = useGetPatientsQuery();
  const { data: patientMeal } = useGetPatientMealQuery();
  const [createMealPlan] = useCreateMealPlanMutation();
  const [createPatientMeal] = useCreatePatientMealMutation();
  const [deleteMealPlan] = useDeleteMealPlanMutation();
  const [deleteAssignMealPlan] = useDeleteAssignMealPlanMutation();
  const [editMealPlan] = useEditMealPlanMutation();
  const [editAssignMealPlan] = useEditAssignMealPlanMutation();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all status');
  const [createNotification] = useCreateNotificationsMutation();
  const { data: logInUser } = useFetchLoggedInUserQuery();
  const [newMeal, setNewMeal] = useState({
    name: "",
    type: "Basic",
    calories: "",
    costPerDay: "",
    status: "Active",
  });
  const [editMealData, setEditMealData] = useState(null)
  const { mode } = useSelector((state) => state.theme);
      
  const isDark = mode === "dark"

  useEffect(()=>{
    if(editMealData){
      setNewMeal({
        name: editMealData.name,
        type: editMealData.type,
        calories: editMealData.calories,
        costPerDay: editMealData.costPerDay,
        status: editMealData.status,
      })
    }
  }, [editMealData])

  const [assignPatientMeal, setAssignPatientMeal] = useState({
    patientId: "",
    MealPlanId: "",
    startDate: "",
    endDate: "",
    status: "",
    billingStatus: "",
    invoiceDate: ""
  });
  
  const [editAssignMeal, setEditAssignMeal] = useState(null);
  
  useEffect(() => {
    if (editAssignMeal) {
      setAssignPatientMeal({
        patientId: editAssignMeal.patientDetails?._id,
        MealPlanId: editAssignMeal.MealPlan?.mealPlanId,
        startDate: editAssignMeal.startDate,
        endDate: editAssignMeal.endDate,
        status: editAssignMeal.status,
        billingStatus: editAssignMeal.billingStatus,
        invoiceDate: editAssignMeal.invoiceDate
      });
    }
  }, [editAssignMeal]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // console.log("newMeal", newMeal)
  // console.log("mealPlans", mealPlans)
  // console.log("patientMeal", patientMeal)
  // console.log("patientData", patientData)
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? (checked ? "Active" : "Inactive") : value,
    }));
  };

  const handleAssignMealChange = (field, value) => {
    setAssignPatientMeal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleCreate = async (e) => {
    e.preventDefault(); // Prevent default form submit
    let response
    try {
      if(editMealData){
        response = await editMealPlan({
          id: editMealData._id,
          ...newMeal,
        }).unwrap();
        setShowAddMealPlan(false);
      }else{
        response = await createMealPlan(newMeal).unwrap(); // Or replace with your actual API call
        toast.success("Meal plan created!");
        setNewMeal({
          name: "",
          type: "Basic",
          calories: "",
          costPerDay: "",
          status: "Active",
        });
        setShowAddMealPlan(false);
      }
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const handleAssignMealSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...assignPatientMeal,
      invoiceDate: new Date().toISOString()
    };
  
    try {
      let response;
  
      if (editAssignMeal) {
        response = await editAssignMealPlan({
          id: editAssignMeal._id,
          ...assignPatientMeal
        }).unwrap();
        toast.success("Meal Plan Updated!");
        setShowAddAssignment(false);
      } else {
        response = await createPatientMeal(payload).unwrap();
        toast.success("Meal Plan Assigned!");
  
        setShowAddAssignment(false);
        setAssignPatientMeal({
          patientId: "",
          MealPlanId: "",
          startDate: "",
          endDate: "",
          status: "Assigned",
          billingStatus: "manual",
          invoiceDate: ""
        });
      }
  
      console.log("response", response)
      if (response?.success === true) {
        socket.emit("meal-plan-assigned", {
          to: response.data.patientDetails,
          message: "Meal assigned to you",
          date: new Date(),
          notDesc: `Pay amount ${response.data.payAmount}`
        });
  
        await createNotification({
          sender: logInUser._id,
          receiver: response.data.patientDetails,
          message: "Meal assigned to you.",
          notDesc: `Pay amount ${response.data.payAmount}`
        });
      }
  
    } catch (err) {
      toast.error("Failed to assign meal plan");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMealPlan(id).unwrap();
      toast.warn('Meal plan deleted!');
    } catch (err) {
      // console.error('Delete error:', err);
    }
  };

  const handleAssignMealDelete = async (id) => {
    try {
      await deleteAssignMealPlan(id).unwrap();
      toast.warn('Assigned Meal plan deleted!');
    } catch (err) {
      // console.error('Delete error:', err);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredMealPlans = mealPlans?.data?.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || plan.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredMealPlanBills = patientMeal?.data?.filter((plan) => {
    const matchesSearch = plan.MealPlan.name.toLowerCase().includes(searchBillTerm.toLowerCase());
    const matchesType = selectedStatus === 'all status' || plan.billingStatus === selectedStatus;
    return matchesSearch && matchesType;
  });
  
  const paginatedRecords = filteredMealPlanBills?.slice(indexOfFirstRecord, indexOfLastRecord) || [];
  const totalPages = Math.ceil((filteredMealPlanBills?.length || 0) / recordsPerPage);

  // Status badge color mapping
  const getStatusColor = (status, isDark) => {
    const statusColors = {
      Active: isDark
        ? "bg-green-900 text-green-300"
        : "bg-green-100 text-green-800",
      Inactive: isDark
        ? "bg-gray-800 text-gray-300"
        : "bg-gray-100 text-gray-800",
      Completed: isDark
        ? "bg-blue-900 text-blue-300"
        : "bg-blue-100 text-blue-800",
      Scheduled: isDark
        ? "bg-purple-900 text-purple-300"
        : "bg-purple-100 text-purple-800",
      Billed: isDark
        ? "bg-blue-900 text-blue-300"
        : "bg-blue-100 text-blue-800",
      Pending: isDark
        ? "bg-yellow-900 text-yellow-300"
        : "bg-yellow-100 text-yellow-800",
      Paid: isDark
        ? "bg-green-900 text-green-300"
        : "bg-green-100 text-green-800",
      "Not Billed": isDark
        ? "bg-gray-800 text-gray-300"
        : "bg-gray-100 text-gray-800",
      Overdue: isDark
        ? "bg-red-900 text-red-300"
        : "bg-red-100 text-red-800",
    };
  
    return statusColors[status] || (isDark
      ? "bg-gray-800 text-gray-300"
      : "bg-gray-100 text-gray-800");
  };

  return (
    <>
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meal Plan Management</h1>
        <div className="flex space-x-2">
          {/* <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowBillingForm(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Billing Management
          </Button> */}
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddMealPlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meal Plan
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="meal-plans">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          <TabsTrigger
            value="meal-plans"
            className="px-4 py-2 rounded-md data-[state=active]:bg-teal-400 data-[state=active]:text-white cursor-pointer"
          >
            Meal Plans
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="px-4 py-2 rounded-md data-[state=active]:bg-teal-400 data-[state=active]:text-white cursor-pointer"
          >
            Patient Assignments
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="px-4 py-2 rounded-md data-[state=active]:bg-teal-400 data-[state=active]:text-white cursor-pointer"
          >
            Billing Records
          </TabsTrigger>
        </TabsList>


          {/* Meal Plans Tab */}
          <TabsContent value="meal-plans">
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Meal Plans</CardTitle>
                    <CardDescription>Manage dietary plans for patients</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search meal plans..."
                        className="pl-8 w-auto border border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={selectedType} onValueChange={(value) => setSelectedType(value)}>
                      <SelectTrigger className="w-[180px] border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-xl p-1.5">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Special">Special</SelectItem>
                        <SelectItem value="Super Special">Super Special</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Calories</TableHead>
                      <TableHead>Cost per Day ($)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMealPlans?.length > 0 ? (
                      filteredMealPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{plan.type}</TableCell>
                          <TableCell>{plan.calories}</TableCell>
                          <TableCell>${plan.costPerDay.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(plan.status, isDark)}>{plan.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="icon" 
                              onClick={() => {
                                setShowAddMealPlan(true)
                                setEditMealData(plan)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(plan._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No meal plans found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Assignments Tab */}
          <TabsContent value="assignments">
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Meal Assignments</CardTitle>
                    <CardDescription>Manage patient meal plan assignments</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowAddAssignment(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Meal Plan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Meal Plan</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientMeal?.data?.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment?.patientDetails?.id}</TableCell>
                        <TableCell className="font-medium">{assignment?.patientDetails?.name}</TableCell>
                        <TableCell>{mealPlans?.data?.find((p) => p.id === assignment.mealPlanId)?.name}</TableCell>
                        <TableCell>{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(assignment.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.status, isDark)}>{assignment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.billingStatus, isDark)}>{assignment.billingStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="icon"
                            onClick={() => {
                              setShowAddAssignment(true)
                              setEditAssignMeal(assignment)
                            }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleAssignMealDelete(assignment._id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Records Tab */}
          <TabsContent value="billing">
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meal Plan Billing Records</CardTitle>
                    <CardDescription>Track and manage meal plan billing</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search meal plans..."
                        className="pl-8 w-auto border border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                        value={searchBillTerm}
                        onChange={(e) => setSearchBillTerm(e.target.value)}
                      />
                    </div>
                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                      <SelectTrigger className="w-[180px] border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-xl p-1.5">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all status">All Status</SelectItem>
                        <SelectItem value="Billed">Billed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Not Billed">Not Billed</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Meal Plan</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount ($)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Status</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredMealPlanBills?.length > 0 ? (
                    paginatedRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.patientDetails.id}</TableCell>
                        <TableCell className="font-medium">{record.patientDetails.name}</TableCell>
                        <TableCell>{record.MealPlan.name}</TableCell>
                        <TableCell>
                          {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${record.payAmount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.billingStatus}
                        </TableCell>
                        <TableCell>{new Date(record.invoiceDate).toLocaleDateString()}</TableCell>
                        {/* <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                                  </div>
                                </TableCell> */}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-muted-foreground">
                                No meal plan bills found.
                              </TableCell>
                            </TableRow>
                          )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
  <div className="text-sm text-gray-500">
    Showing {paginatedRecords.length} of {filteredMealPlanBills?.length || 0} records
  </div>
  <div className="flex items-center space-x-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
</CardFooter>

            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
      {/* Add Meal Plan Dialog */}
      <Dialog open={showAddMealPlan} onOpenChange={setShowAddMealPlan}>
      <DialogContent className="sm:max-w-[600px]">
    <form onSubmit={handleCreate} className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-900">Create a New Meal Plan</DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          Fill out the form below to add a new meal plan.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right font-medium text-gray-700">
            Name
          </Label>
          <Input
            id="name"
            value={newMeal.name}
            onChange={handleInputChange}
            placeholder="Meal plan name"
            className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right font-medium text-gray-700">
            Type
          </Label>
          <select
                id="type"
                value={newMeal.type}
                onChange={handleInputChange}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Anesthesia</option>
                <option value="Regular">Regular</option>
                <option value="Special">Special</option>
                <option value="Super Special">Super Special</option>
                <option value="Basic">Basic</option>
              </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="calories" className="text-right font-medium text-gray-700">
            Calories
          </Label>
          <Input
            id="calories"
            type="number"
            value={newMeal.calories}
            onChange={handleInputChange}
            placeholder="e.g. 2000"
            className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="costPerDay" className="text-right font-medium text-gray-700">
            Cost / Day
          </Label>
          <Input
            id="costPerDay"
            type="number"
            step="0.01"
            value={newMeal.costPerDay}
            onChange={handleInputChange}
            placeholder="$"
            className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right font-medium text-gray-700">
            Status
          </Label>
          <div className="flex items-center col-span-3 space-x-3">
          <select
                id="status"
                value={newMeal.status}
                onChange={handleInputChange}
                className="col-span-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Type</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddMealPlan(false)}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
          Save Meal Plan
        </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>


      {/* Assign Meal Plan Dialog */}
      <Dialog open={showAddAssignment} onOpenChange={setShowAddAssignment}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Meal Plan to Patient</DialogTitle>
            <DialogDescription>Assign a meal plan to a patient and set the duration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignMealSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient
              </Label>
              <Select onValueChange={(value) => handleAssignMealChange("patientId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientData?.data?.map((patient)=>{
                    return(
                      <SelectItem 
                        key={patient._id}
                        value={patient._id}>
                          {patient.id}: {patient.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mealplan" className="text-right">
                Meal Plan
              </Label>
              <Select onValueChange={(value) => handleAssignMealChange("MealPlanId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                  {mealPlans?.data?.map((meal)=>{
                    return(
                      <SelectItem 
                      value={meal._id}>{meal.mealPlanId}: {meal.name}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input id="startDate" type="date" className="col-span-3" onChange={(e) => handleAssignMealChange("startDate", e.target.value)}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input id="endDate" type="date" className="col-span-3" onChange={(e) => handleAssignMealChange("endDate", e.target.value)}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mealplan" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => handleAssignMealChange("status", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                      <SelectItem 
                      value="Active">Active</SelectItem>
                      <SelectItem 
                      value="Inactive">In Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mealplan" className="text-right">
                Billing Status
              </Label>
              <Select onValueChange={(value) => handleAssignMealChange("billingStatus", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                      <SelectItem 
                      value="Billed">Billed</SelectItem>
                      <SelectItem 
                      value="Pending">Pending</SelectItem>
                      <SelectItem 
                      value="Paid">Paid</SelectItem>
                      <SelectItem 
                      value="Not Billed">Not Billed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAssignment(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              Assign Meal Plan
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Billing Management Dialog */}
      <Dialog open={showBillingForm} onOpenChange={setShowBillingForm}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Meal Plan Billing Management</DialogTitle>
            <DialogDescription>Generate and manage billing for patient meal plans.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingType" className="text-right">
                Billing Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select billing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Patient</SelectItem>
                  <SelectItem value="batch">Batch Processing</SelectItem>
                  <SelectItem value="insurance">Insurance Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1001">P-1001: John Smith</SelectItem>
                  <SelectItem value="p1002">P-1002: Sarah Johnson</SelectItem>
                  <SelectItem value="p1003">P-1003: Robert Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingPeriod" className="text-right">
                Billing Period
              </Label>
              <div className="col-span-3 flex space-x-2">
                <Input type="date" placeholder="Start date" />
                <Input type="date" placeholder="End date" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountType" className="text-right">
                Discount
              </Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Amount" className="w-[120px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Billing Notes
              </Label>
              <Input id="notes" placeholder="Additional billing information" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="flex flex-col space-y-2 col-span-3">
                <div className="flex items-center space-x-2">
                  {/* <Checkbox id="sendEmail" /> */}
                  <label htmlFor="sendEmail" className="text-sm font-medium leading-none">
                    Send email notification
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <Checkbox id="printInvoice" /> */}
                  <label htmlFor="printInvoice" className="text-sm font-medium leading-none">
                    Print invoice automatically
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <Checkbox id="includeDetails" /> */}
                  <label htmlFor="includeDetails" className="text-sm font-medium leading-none">
                    Include detailed meal breakdown
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              Generate Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nutritional Information Card */}
      {/* <Card className="mb-6 border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Nutritional Management</CardTitle>
          <CardDescription>Track and manage nutritional requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dietary Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="vegetarian" />
                  <label htmlFor="vegetarian">Vegetarian</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="vegan" />
                  <label htmlFor="vegan">Vegan</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="glutenFree" />
                  <label htmlFor="glutenFree">Gluten-Free</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="dairyFree" />
                  <label htmlFor="dairyFree">Dairy-Free</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="lowCarb" />
                  <label htmlFor="lowCarb">Low-Carb</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="kosher" />
                  <label htmlFor="kosher">Kosher</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="halal" />
                  <label htmlFor="halal">Halal</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="nutFree" />
                  <label htmlFor="nutFree">Nut-Free</label>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Menu Planning</h3>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Weekly Menu
                </Button>
                <Button variant="outline" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Meal Schedule
                </Button>
                <Button variant="outline" className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Allergies
                </Button>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                <p>
                  Connect with inventory system to check ingredient availability for meal planning and automatically
                  adjust menus based on stock levels.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </>
  )
}

