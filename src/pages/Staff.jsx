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
import { Avatar, AvatarFallback, AvatarImage } from "../components/UI/Avatar"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  MoreHorizontal,
  Calendar,
  FileText,
  Users,
  Mail,
  Activity,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/UI/DropMenu"
import { cn } from "../components/Lib/Utilis"
import { useAddDoctorMutation, useDeleteDoctorMutation, useGetDoctorsQuery, useUpdateDoctorMutation } from "../redux/slices/doctorSlice"
import { useCreateShiftMutation, useGetShiftsQuery } from "../redux/slices/shiftSlice"
import { useGetRolesQuery } from "../redux/slices/roleSlice"
import { toast } from "react-toastify";
import { useSelector } from "react-redux"

export default function Staff() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showShift, setShowShift] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)

  const { data, error, isLoading, isFetching, isSuccess, isError } = useGetDoctorsQuery();
  const { data: shiftData, error: shiftError, isLoading: shiftIsLoading, isFetching: shiftIsFetching, isSuccess: shiftIsSuccess, isError: shiftIsError } = useGetShiftsQuery();
  // console.log("shiftData", shiftData?.shifts);
  const [staffMembers, setStaffMembers] = useState();
  const [shifts, setShifts] = useState();
  const [addDoctor] = useAddDoctorMutation();
  const [updateDoctor] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [createShift] = useCreateShiftMutation();
  const { data: roles, error: roleError, isSuccess: roleIsSuccess } = useGetRolesQuery();
  const [RoleList, setRoleList] = useState(roles);

  useEffect(() => {
    if (roles) {
      // console.log("roles", roles)
      setRoleList(roles || []);
    }
  }, [roles, roleIsSuccess]);


  useEffect(() => {
    if (data) {
      setStaffMembers(data.data?.filter((staff) => staff?.role_id?.role_name !== "Doctor"));
    }

  }, [data]);
  useEffect(() => {
    if (shiftData) {
      setShifts(shiftData?.shifts);
    }
  }, [shiftData]);

  // const [staffMembers, setStaffMembers] = useState([
  //   {
  //     id: "STF-001",
  //     name: "Nour Ahmed",
  //     role: "Nurse",
  //     department: "Emergency",
  //     gender: "Female",
  //     phone: "+20 123-456-7890",
  //     email: "nour.ahmed@healthtoheart.com",
  //     joinDate: "Jan 15, 2022",
  //     status: "active",
  //     avatar: "/placeholder-user.jpg",
  //   },
  //   {
  //     id: "STF-002",
  //     name: "Karim Ibrahim",
  //     role: "Lab Technician",
  //     department: "Laboratory",
  //     gender: "Male",
  //     phone: "+20 123-456-7891",
  //     email: "karim.ibrahim@healthtoheart.com",
  //     joinDate: "Mar 10, 2021",
  //     status: "active",
  //     avatar: "/placeholder-user.jpg",
  //   },
  //   {
  //     id: "STF-003",
  //     name: "Amira Saeed",
  //     role: "Receptionist",
  //     department: "Administration",
  //     gender: "Female",
  //     phone: "+20 123-456-7892",
  //     email: "amira.saeed@healthtoheart.com",
  //     joinDate: "Jun 5, 2023",
  //     status: "active",
  //     avatar: "/placeholder-user.jpg",
  //   },
  //   {
  //     id: "STF-004",
  //     name: "Hassan Ali",
  //     role: "Pharmacist",
  //     department: "Pharmacy",
  //     gender: "Male",
  //     phone: "+20 123-456-7893",
  //     email: "hassan.ali@healthtoheart.com",
  //     joinDate: "Sep 20, 2022",
  //     status: "active",
  //     avatar: "/placeholder-user.jpg",
  //   },
  //   {
  //     id: "STF-005",
  //     name: "Leila Mahmoud",
  //     role: "Nurse",
  //     department: "Pediatrics",
  //     gender: "Female",
  //     phone: "+20 123-456-7894",
  //     email: "leila.mahmoud@healthtoheart.com",
  //     joinDate: "Feb 12, 2023",
  //     status: "on-leave",
  //     avatar: "/placeholder-user.jpg",
  //   },
  // ])

  // Sample data for shifts
  // const [shifts, setShifts] = useState([
  //   {
  //     id: "SHF-001",
  //     staffId: "STF-001",
  //     staffName: "Nour Ahmed",
  //     day: "Monday",
  //     startTime: "07:00 AM",
  //     endTime: "03:00 PM",
  //     type: "Morning",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-002",
  //     staffId: "STF-001",
  //     staffName: "Nour Ahmed",
  //     day: "Tuesday",
  //     startTime: "07:00 AM",
  //     endTime: "03:00 PM",
  //     type: "Morning",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-003",
  //     staffId: "STF-002",
  //     staffName: "Karim Ibrahim",
  //     day: "Monday",
  //     startTime: "09:00 AM",
  //     endTime: "05:00 PM",
  //     type: "Day",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-004",
  //     staffId: "STF-002",
  //     staffName: "Karim Ibrahim",
  //     day: "Wednesday",
  //     startTime: "09:00 AM",
  //     endTime: "05:00 PM",
  //     type: "Day",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-005",
  //     staffId: "STF-003",
  //     staffName: "Amira Saeed",
  //     day: "Monday",
  //     startTime: "08:00 AM",
  //     endTime: "04:00 PM",
  //     type: "Day",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-006",
  //     staffId: "STF-003",
  //     staffName: "Amira Saeed",
  //     day: "Thursday",
  //     startTime: "08:00 AM",
  //     endTime: "04:00 PM",
  //     type: "Day",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-007",
  //     staffId: "STF-004",
  //     staffName: "Hassan Ali",
  //     day: "Tuesday",
  //     startTime: "03:00 PM",
  //     endTime: "11:00 PM",
  //     type: "Evening",
  //     status: "active",
  //   },
  //   {
  //     id: "SHF-008",
  //     staffId: "STF-004",
  //     staffName: "Hassan Ali",
  //     day: "Friday",
  //     startTime: "03:00 PM",
  //     endTime: "11:00 PM",
  //     type: "Evening",
  //     status: "active",
  //   },
  // ])

  // Filter staff based on search query
  const filteredStaff = staffMembers?.filter(
    (staff) =>
      staff.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      staff.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      staff.role?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  // Filter shifts based on search query
  const filteredShifts = shifts?.filter(
    (shift) =>
      shift?.staffId?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      shift?.staffId?.email?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      shift.type?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  // Add new staff
  const handleAddStaff = async (newStaff) => {
    try {

      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const staffData = {
        ...newStaff,
        joinDate: today,
        status: "active",
        avatar: "/placeholder-user.jpg",
      };

      const response = await addDoctor(staffData).unwrap(); // API call

      if (response.success) {
        setStaffMembers((prev) => [...prev, response.data]); // Update UI
        setShowAddStaff(false);
      } else {
        // console.error("Error:", response.error);
      }
    } catch (err) {
      // console.error("API Error:", err);
    }
  };

  // Update staff
  const handleUpdateStaff = async (updatedStaff) => {
    try {
      await updateDoctor({ id: updatedStaff._id, ...updatedStaff }).unwrap();
      setSelectedStaff(null); // Close the dialog
      toast.success("Staff updated successfully!");
      const updated = await updateDoctor({ id: updatedStaff._id, ...updatedStaff }).unwrap();
      setStaffMembers((prev) =>
        prev.map((staff) => (staff._id === updated._id ? updated : staff))
      );
    } catch (error) {
      // console.error("Failed to update staff:", error);
      toast.error("Failed to update staff");
    }
  };

  // Delete staff
  const handleDeleteStaff = async (id) => {
    try {
      await deleteDoctor(id).unwrap();
      setShifts((prev) => prev.filter((shift) => shift.staffId !== id));
    } catch (error) {
      // console.error("Failed to delete staff:", error);
    }
  };

  // Add new shift
  const handleAddShift = async (newShift) => {
    try {
      const response = await createShift(newShift).unwrap();
      if (response.success) {
        toast.success("Shift created successfully!");
        setShowShift(false)
      }
    } catch (error) {
      // console.error("Failed to create shift:", error);
      toast.error("Failed to create shift");

    }


  }

  // Update shift
  const handleUpdateShift = (updatedShift) => {
    setShifts(shifts?.map((shift) => (shift.id === updatedShift.id ? updatedShift : shift)))
    setSelectedShift(null)
  }

  // Delete shift
  const handleDeleteShift = (id) => {
    setShifts(shifts?.filter((shift) => shift.id !== id))
  }

  const { role } = useSelector((state) => state.role);

  return (
    <>
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <div className="flex gap-2 flex-col md:flex-row">
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowShift(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
          {(role === "admin" || role === "superadmin") && (
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddStaff(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
          )}
        </div>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search staff by name, role, or department..."
            className="pl-8 w-full border border-gray-200 p-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Button variant="outline" size="icon" className="ml-2">
          <Filter className="h-4 w-4" />
        </Button> */}
        <Button variant="outline" size="sm" className="ml-2">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="staff" className="mb-6">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          <TabsTrigger value="staff" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="shifts" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Staff Shifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>Complete list of hospital staff</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff?.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback>{staff.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff?.role_id?.role_name}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{staff.email}</span>
                          <span className="text-xs text-muted-foreground">{staff.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            staff.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          )}
                        >
                          {staff.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => setSelectedStaff(staff)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteStaff(staff.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setShowShift(true)
                                // Pre-select this staff for shift
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Add Shift
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

        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Staff Shifts</CardTitle>
              <CardDescription>View and manage staff schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Break Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts?.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift?.staffId?.id}</TableCell>
                      <TableCell>{shift?.staffId?.name}</TableCell>
                      <TableCell>{shift.day}</TableCell>
                      <TableCell>
                        {shift.startTime} - {shift.endTime}
                      </TableCell>
                      <TableCell>
                        {shift.breakTime?.start} - {shift.breakTime?.end}
                      </TableCell>
                      <TableCell>{shift.type}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            shift.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                          )}
                        >
                          {shift.status}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => setSelectedShift(shift)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteShift(shift.id)}>
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
      </Tabs>
    </div>
      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Enter the details of the new staff member.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newStaff = {
                prefix: formData.get("prefix"),
                first_name: formData.get("first_name"),
                last_name: formData.get("last_name"),
                roleName: formData.get("roleName"),
                department: formData.get("department"),
                gender: formData.get("gender"),
                phone: formData.get("phone"),
                email: formData.get("email"),
                category: formData.get("category"),
                password: formData.get("password"),
              };
              handleAddStaff(newStaff);
            }}
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prefix" className="text-right">Prefix</Label>
              <select name="prefix" className="col-span-3 border p-2 rounded" required>
                <option value="">Select Prefix</option>
                <option value="Dr">Dr</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="">None</option>
              </select>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">First Name</Label>
                <Input id="first_name" name="first_name" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">Last Name</Label>
                <Input id="last_name" name="last_name" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roleName" className="text-right">Role</Label>
                <select name="roleName" className="col-span-3 border p-2 rounded" required>
                  <option value="">Select Role</option>
                  {RoleList?.map((role) => (
                    //if role.role_name ===Doctor not show
                    role.role_name !== "Doctor" && (
                      <option key={role?._id
                      } value={role?.role_name
                      }>{role?.role_name}</option>
                    )


                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <select name="department" className="col-span-3 border p-2 rounded" required>
                  <option value="">Select Department</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">Gender</Label>
                <select name="gender" className="col-span-3 border p-2 rounded" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Gender</Label>
                <select name="category" className="col-span-3 border p-2 rounded" required>
                  <option value="">Select category</option>
                  <option value="Medical">Medical</option>
                  <option value="NonMedical">NonMedical</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" name="password" type="password" className="col-span-3" required />

              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update the details of the staff member.</DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedStaff = {
                  ...selectedStaff,
                  prefix: formData.get("prefix"),
                  first_name: formData.get("first_name"),
                  last_name: formData.get("last_name"),
                  roleName: formData.get("roleName"),
                  department: formData.get("department"),
                  gender: formData.get("gender"),
                  category: formData.get("category"),
                  phone: formData.get("phone"),
                  email: formData.get("email"),
                  status: formData.get("status"),
                };
                handleUpdateStaff(updatedStaff);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-prefix" className="text-right">Prefix</Label>
                  <select name="prefix" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.prefix} required>
                    <option value="">Select Prefix</option>
                    <option value="Dr">Dr</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="">None</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-first_name" className="text-right">First Name</Label>
                  <Input id="edit-first_name" name="first_name" defaultValue={selectedStaff.first_name} className="col-span-3" required />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-last_name" className="text-right">Last Name</Label>
                  <Input id="edit-last_name" name="last_name" defaultValue={selectedStaff.last_name} className="col-span-3" required />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-roleName" className="text-right">Role</Label>
                  <select name="roleName" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.roleName} required>
                    <option value="">Select Role</option>
                    {RoleList?.map(
                      (role) =>
                        role.role_name !== "Doctor" && (
                          <option key={role._id} value={role.role_name}>
                            {role.role_name}
                          </option>
                        )
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-department" className="text-right">Department</Label>
                  <select name="department" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.department} required>
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-gender" className="text-right">Gender</Label>
                  <select name="gender" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.gender} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Category</Label>
                  <select name="category" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.category} required>
                    <option value="">Select Category</option>
                    <option value="Medical">Medical</option>
                    <option value="NonMedical">NonMedical</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                  <Input id="edit-phone" name="phone" defaultValue={selectedStaff.phone} className="col-span-3" required />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={selectedStaff.email} className="col-span-3" required />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Status</Label>
                  <select name="status" className="col-span-3 border p-2 rounded" defaultValue={selectedStaff.status} required>
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedStaff(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Staff
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={showShift} onOpenChange={setShowShift}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
            <DialogDescription>Create a new shift for a staff member.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newShift = {
                staffId: formData.get("staffId"),
                date: formData.get("date"),
                startTime: formData.get("startTime"),
                endTime: formData.get("endTime"),
                status: "active",
                breakTime: {
                  start: formData.get("breakStart") || null,
                  end: formData.get("breakEnd") || null,
                },
              };
              handleAddShift(newShift);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* Staff Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staffId" className="text-right">
                  Staff
                </Label>
                <select name="staffId" id="staffId" className="col-span-3 p-2 border rounded" required>
                  <option value="">Select staff</option>
                  {staffMembers
                    ?.filter((s) => s.status === "active")
                    ?.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date Picker */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input id="date" name="date" type="date" className="col-span-3" required />
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input id="startTime" name="startTime" type="time" className="col-span-3" required />
              </div>

              {/* End Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input id="endTime" name="endTime" type="time" className="col-span-3" required />
              </div>

              {/* Break Start (optional) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="breakStart" className="text-right">
                  Break Start
                </Label>
                <Input id="breakStart" name="breakStart" type="time" className="col-span-3" />
              </div>

              {/* Break End (optional) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="breakEnd" className="text-right">
                  Break End
                </Label>
                <Input id="breakEnd" name="breakEnd" type="time" className="col-span-3" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowShift(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Add Shift
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>Update the staff shift details.</DialogDescription>
          </DialogHeader>

          {selectedShift && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const staffId = formData.get("staffId");
                const staff = staffMembers.find(
                  (s) => s.id === staffId || s._id === staffId
                );

                const updatedShift = {
                  ...selectedShift,
                  staffId,
                  staffName: staff ? staff.name : selectedShift.staffName,
                  date: formData.get("date"),
                  startTime: formData.get("startTime"),
                  endTime: formData.get("endTime"),
                  status: formData.get("status"),
                  breakTime: {
                    start: formData.get("breakStart") || null,
                    end: formData.get("breakEnd") || null,
                  },
                };

                handleUpdateShift(updatedShift);
              }}
            >
              <div className="grid gap-4 py-4">
                {/* Staff */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-staffId" className="text-right">
                    Staff
                  </Label>
                  <select
                    name="staffId"
                    id="edit-staffId"
                    className="col-span-3 p-2 border rounded"
                    defaultValue={selectedShift.staffId}
                    required
                  >
                    <option value="">Select staff</option>
                    {staffMembers
                      ?.filter((s) => s.status === "active")
                      ?.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    className="col-span-3"
                    defaultValue={selectedShift.date?.split("T")[0]}
                    required
                  />
                </div>

                {/* Start Time */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="edit-startTime"
                    name="startTime"
                    type="time"
                    className="col-span-3"
                    defaultValue={selectedShift.startTime}
                    required
                  />
                </div>

                {/* End Time */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-endTime" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="edit-endTime"
                    name="endTime"
                    type="time"
                    className="col-span-3"
                    defaultValue={selectedShift.endTime}
                    required
                  />
                </div>

                {/* Break Start */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-breakStart" className="text-right">
                    Break Start
                  </Label>
                  <Input
                    id="edit-breakStart"
                    name="breakStart"
                    type="time"
                    className="col-span-3"
                    defaultValue={
                      selectedShift.breakTime?.start
                        ?selectedShift.breakTime?.start
                        : ""
                    }
                  />
                </div>

                {/* Break End */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-breakEnd" className="text-right">
                    Break End
                  </Label>
                  <Input
                    id="edit-breakEnd"
                    name="breakEnd"
                    type="time"
                    className="col-span-3"
                    defaultValue={
                      selectedShift.breakTime?.end
                        ? selectedShift.breakTime.end: ""
                    }
                  />
                </div>

                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <select
                    name="status"
                    id="edit-status"
                    className="col-span-3 p-2 border rounded"
                    defaultValue={selectedShift.status}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedShift(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Shift
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}

