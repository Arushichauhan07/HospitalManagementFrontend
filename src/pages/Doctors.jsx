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
import { Plus, Search, Edit, Trash2, Download, Filter, MoreHorizontal, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/UI/DropMenu"
import { cn } from "../components/Lib/Utilis"
import { useGetDoctorsQuery, useAddDoctorMutation, useUpdateDoctorMutation, useDeleteDoctorMutation } from "../redux/slices/doctorSlice"
import axios from "axios"
import { useCreateScheduleMutation, useDeleteScheduleMutation, useGetAllSchedulesQuery, useUpdateScheduleMutation } from "../redux/slices/schedule"
import { toast } from "react-toastify";
import { useGetRolesQuery } from "../redux/slices/roleSlice";
import { useSelector } from "react-redux";

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { data, error, isLoading, isFetching, isSuccess, isError } = useGetDoctorsQuery();
  const { data: scheduleData, error: scheduleError, isLoading: scheduleIsLoading, isFetching: scheduleIsFetching, isSuccess: scheduleIsSuccess, isError: scheduleIsError } = useGetAllSchedulesQuery();
  // // console.log("scheduleData", scheduleData?.data);
  const [addDoctor] = useAddDoctorMutation();

  const [updateDoctor] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [createSchedule] = useCreateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [updateSchedule, { isLoading: updateScheduleLoading }] = useUpdateScheduleMutation();
  const { data: roles, error: roleError, isSuccess: roleIsSuccess } = useGetRolesQuery();
  const [RoleList, setRoleList] = useState(roles);

  useEffect(() => {
    if (roles) {
      // console.log("roles", roles)
      setRoleList(roles || []);
    }
  }, [roles, roleIsSuccess]);

  const [doctors, setDoctors] = useState(data?.data || []);
  const [schedules, setSchedules] = useState([]);
  const { mode } = useSelector((state) => state.theme);

  // console.log("schedule", schedules)
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    phone: "",
    password: "",
    roleName: "",
    gender: "",
    category: "",
    department: "",
    specialization: "",
    educationDetails: "",
    experienceDetails: "",
    experienceYears: "",
    description: "",
    availability: "",
    status: "",
    joinDate: "",
  });


  // console.log("formData", formData)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const staffData = {
        ...formData,
        joinDate: today,
        status: "active",
        avatar: "/placeholder-user.jpg",
      };

      const response = await addDoctor(staffData).unwrap(); // Your API call

      if (response.success) {
        toast.success("Doctor added successfully!");
        setShowAddDoctor(false); // Hide the dialog
        // clear form data
        setFormData({
          first_name: "",
          email: "",
          phone: "",
          password: "",
          roleName: "",
          gender: "",
          category: "",
          department: "",
          specialization: "",
          educationDetails: "",
          experienceDetails: "",
          experienceYears: "",
          description: "",
          availability: "",
          status: "",
          joinDate: "",
        })

      } else {
        // console.error("Add doctor failed:", response.error);
      }
    } catch (err) {
      // console.error("API Error:", err);
    }
  };


  useEffect(() => {
    // set only doctor if data.data.role_id.role_name === "Doctor"
    if (data) {
      setDoctors(data.data.filter((doctor) => doctor?.role_id?.role_name === "Doctor"));
    }

  }, [data]);
  useEffect(() => {
    setSchedules(scheduleData?.data || []);
  }, [scheduleData]);

  // Filter doctors based on search query
  const filteredDoctors = doctors?.filter(
    (doctor) =>
      doctor?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      doctor?.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      doctor?.specialization?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  const filteredSchedules = schedules?.filter(
    (schedule) =>
      schedule?.doctorId?.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      schedule?.doctorId?.id.toLowerCase().includes(searchQuery?.toLowerCase())
  )

  // Add new doctor
  const handleAddDoctor = (newDoctor) => {
    const id = `DOC-${(doctors.length + 1).toString().padStart(3, "0")}`
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    setDoctors([
      ...doctors,
      {
        ...newDoctor,
        id,
        joinDate: today,
        status: "active",
        avatar: "/placeholder-user.jpg",
      },
    ])
    setShowAddDoctor(false)
  }

  // Update doctor
  const handleUpdateDoctor = async (updatedDoctor) => {
    try {
      const { id, ...doctorData } = updatedDoctor;

      const response = await updateDoctor({ id, ...doctorData });

      if ("error" in response) {
        // console.error("Failed to update doctor:", response.error);
      } else {
        // Optionally update local state if you need immediate UI change
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor.id === id ? { ...doctor, ...doctorData } : doctor
          )
        );
        setSelectedDoctor(null);
      }
    } catch (err) {
      // console.error("Unexpected error updating doctor:", err);
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (id) => {
    try {
      const response = await deleteDoctor(id);

      if ("error" in response) {
        // console.error("Failed to delete doctor:", response.error);
      } else {
        // Optimistically update local state if you want instant feedback
        setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
        setSchedules((prev) => prev.filter((schedule) => schedule.doctorId !== id));
      }
    } catch (err) {
      // console.error("Unexpected error deleting doctor:", err);
    }
  };
  // Add new schedule
  const handleAddSchedule = async (newSchedule) => {
    try {
      // console.log(newSchedule);
      // Ensure correct format for API
      const formattedSchedule = {
        ...newSchedule,
      };

      const response = await createSchedule(formattedSchedule).unwrap();

      if (response.success) {
        toast.success("Schedule created successfully!");
        setShowSchedule(false);
      } else {
        toast.error(response.error || "Something went wrong.");
      }
    } catch (error) {
      // console.error("Error creating schedule:", error);
      toast.error(error?.data?.error || "Failed to create schedule.");
    }
  };

  // Update schedule
  const handleUpdateSchedule = async (updatedSchedule) => {
    try {
      const { id, _id, ...rest } = updatedSchedule;
      const scheduleId = _id || id; // support either key
  
      const res = await updateSchedule({ scheduleId, ...rest }).unwrap();
  
      // console.log("Updated successfully:", res);
      setSelectedSchedule(null);
    } catch (error) {
      // console.error("Update failed:", error);
      toast.error("Failed to update schedule");
    }
  };
  // Delete schedule
  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id).unwrap(); // call API and unwrap result
      setSchedules((prev) => prev.filter((schedule) => schedule._id !== id)); // update local UI state
      toast.success("Schedule deleted successfully!");
    } catch (err) {
      // console.error("Failed to delete schedule:", err);
      toast.error("Failed to delete schedule");
    }
  };

  const { role } = useSelector((state) => state.role);

  return (
    <>
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <div className="flex gap-2 flex-col md:flex-row">
          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowSchedule(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
          {(role === "admin" || role === "superadmin") && (
            <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddDoctor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
          )}
          
        </div>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors by name, ID, or specialty..."
            className="pl-8 w-full border-2 border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
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

      <Tabs defaultValue="doctors" className="mb-6">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          <TabsTrigger value="doctors" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Doctors
          </TabsTrigger>
          <TabsTrigger value="schedules" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Doctor Directory</CardTitle>
              <CardDescription>Complete list of hospital doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors?.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doctor.avatar} />
                            <AvatarFallback>{doctor.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{doctor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doctor?.specialization}</TableCell>
                      <TableCell>{doctor?.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{doctor.email}</span>
                          <span className="text-xs text-muted-foreground">{doctor.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.joinDate?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            doctor.status === "active"
                            ? mode === "dark"
                            ? "bg-green-900 text-green-300"
                            : "bg-green-100 text-green-800"
                          : mode === "dark"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {doctor.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => setSelectedDoctor(doctor)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {(role === "admin" || role === "superadmin") && <DropdownMenuItem onClick={() => handleDeleteDoctor(doctor._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            }
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setShowSchedule(true)
                                // Pre-select this doctor for schedule

                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Add Schedule
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

        <TabsContent value="schedules" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Doctor Schedules</CardTitle>
              <CardDescription>View and manage doctor schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules?.map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell className="font-medium">{schedule.doctorId?.id}</TableCell>
                      <TableCell>{schedule.doctorId.name}</TableCell>
                      <TableCell>{schedule.date.split("T")[0]}</TableCell>
                      <TableCell>
                        {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>{schedule.filledSlots}/{schedule.totalSlots}</TableCell>
                      <TableCell>
                        {schedule.breakTime && schedule.breakTime.length > 0
                          ? `${new Date(schedule.breakTime[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            ${new Date(schedule.breakTime[0].end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'No Break'}
                      </TableCell>

                      {/* <TableCell>
                        <Badge
                          className={
                            `${schedule.status === "active"}
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800",`
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell> */}
                      <TableCell className="text-right ">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedSchedule(schedule)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSchedule(schedule._id)}>
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
      {/* Add Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6 shadow-lg">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-800">Add Doctor</DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter the details of the new doctor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Prefix + First + Last Name */}
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-1">
                <label htmlFor="prefix" className="block text-gray-700 font-medium mb-1">Prefix</label>
                <select
                  id="prefix"
                  name="prefix"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                  <option value="">--</option>
                  <option value="Dr">Dr</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="first_name" className="block text-gray-700 font-medium mb-1">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>

              <div className="col-span-3">
                <label htmlFor="last_name" className="block text-gray-700 font-medium mb-1">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>
            </div>

            {/* Department + Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-gray-700 font-medium mb-1">Department</label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                />
              </div>
            </div>

            {/* Role + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="roleName" className="block text-gray-700 font-medium mb-1">Role</label>
                <select
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                  <option disabled value="">Select Role</option>
                  {roles?.map((role) =>
                    role.role_name === "Doctor" && (
                      <option key={role._id} value={role.role_name}>
                        {role.role_name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Category + Specialization */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                  <option disabled value="">Select Category</option>
                  <option value="Medical">Medical</option>
                  <option value="NonMedical">NonMedical</option>
                  {/* {categories?.map((category) => (
        <option key={category._id} value={category.category_name}>
          {category.category_name}
        </option>
      ))} */}
                </select>
              </div>

              <div>
                <label htmlFor="specialization" className="block text-gray-700 font-medium mb-1">Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                >
                  <option disabled value="">Select specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 text-white font-medium py-2 rounded-lg hover:bg-teal-600 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Doctor"}
            </button>
          </form>

        </DialogContent>
      </Dialog>




      {/* Edit Doctor Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6 shadow-lg">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-800">Edit Doctor</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update the details of the doctor.
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedDoctor = {
                  ...selectedDoctor,
                  prefix: formData.get("prefix"),
                  first_name: formData.get("first_name"),
                  last_name: formData.get("last_name"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  department: formData.get("department"),
                  password: formData.get("password"), // Optional: only update if value is not empty
                  roleName: formData.get("roleName"),
                  gender: formData.get("gender"),
                  category: formData.get("category"),
                  specialization: formData.get("specialization"),
                };
                if (!updatedDoctor.password) delete updatedDoctor.password;
                handleUpdateDoctor(updatedDoctor);
              }}
              className="space-y-5"
            >
              {/* Prefix + First + Last Name */}
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                  <label htmlFor="prefix" className="block text-gray-700 font-medium mb-1">Prefix</label>
                  <select
                    id="prefix"
                    name="prefix"
                    defaultValue={selectedDoctor.prefix}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  >
                    <option value="">--</option>
                    <option value="Dr">Dr</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label htmlFor="first_name" className="block text-gray-700 font-medium mb-1">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    defaultValue={selectedDoctor.first_name}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>

                <div className="col-span-3">
                  <label htmlFor="last_name" className="block text-gray-700 font-medium mb-1">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    defaultValue={selectedDoctor.last_name}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedDoctor.email}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={selectedDoctor.phone}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>
              </div>

              {/* Department + Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-gray-700 font-medium mb-1">Department</label>
                  <input
                    id="department"
                    name="department"
                    defaultValue={selectedDoctor.department}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password (optional)</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  />
                </div>
              </div>

              {/* Role + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="roleName" className="block text-gray-700 font-medium mb-1">Role</label>
                  <select
                    id="roleName"
                    name="roleName"
                    defaultValue={selectedDoctor.roleName}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  >
                    <option disabled value="">Select Role</option>
                    {roles?.map((role) =>
                      role.role_name === "Doctor" && (
                        <option key={role._id} value={role.role_name}>
                          {role.role_name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={selectedDoctor.gender}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Category + Specialization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-gray-700 font-medium mb-1">Category</label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={selectedDoctor.category}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  >
                    <option disabled value="">Select Category</option>
                    <option value="Medical">Medical</option>
                    <option value="NonMedical">NonMedical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-gray-700 font-medium mb-1">Specialization</label>
                  <select
                    name="specialization"
                    defaultValue={selectedDoctor.specialization}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
                  >
                    <option disabled value="">Select specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                >
                  Update Doctor
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>


      {/* Add Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="sm:max-w-[600px] rounded-lg p-6 shadow-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold text-gray-800">Add Schedule</DialogTitle>
            <DialogDescription className="text-gray-500">
              Create a new schedule for a doctor.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const breakTime = Array.from(document.querySelectorAll(".break-row")).map((row) => ({
                start: `${formData.get("date")}T${row.querySelector('[name="breakStart"]').value}:00+05:30`,
                end: `${formData.get("date")}T${row.querySelector('[name="breakEnd"]').value}:00+05:30`,
              }));

              const newSchedule = {
                doctorId: formData.get("doctorId"),
                date: formData.get("date"),
                startTime: `${formData.get("date")}T${formData.get("startTime")}:00+05:30`,
                endTime: `${formData.get("date")}T${formData.get("endTime")}:00+05:30`,
                slotDuration: parseInt(formData.get("slotDuration")),
                breakTime: breakTime.filter(b => b.start && b.end), // remove empty
              };

              handleAddSchedule(newSchedule);
            }}
            className="space-y-4"
          >
            {/* Doctor Selection */}
            <div className="grid gap-3">
              <Label htmlFor="doctorId" className="text-gray-700 font-medium">Doctor</Label>
              <select
                name="doctorId"
                value={selectedDoctor?._id}
                required
                className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Select doctor</option>
                {doctors
                  .filter((doc) => doc.status === "active")
                  .map((doctor) => (
                    <option key={doctor?._id} value={doctor?._id}>
                      {doctor.id}{" - "}{doctor.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="grid gap-3">
              <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-300"
              />
            </div>

            {/* Start Time */}
            <div className="grid gap-3">
              <Label htmlFor="startTime" className="text-gray-700 font-medium">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* End Time */}
            <div className="grid gap-3">
              <Label htmlFor="endTime" className="text-gray-700 font-medium">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Slot Duration */}
            <div className="grid gap-3">
              <Label htmlFor="slotDuration" className="text-gray-700 font-medium">Slot Duration (minutes)</Label>
              <Input
                id="slotDuration"
                name="slotDuration"
                type="number"
                min="1"
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Break Time(s) */}
            <div className="grid gap-3">
              <Label className="text-gray-700 font-medium">Break Time(s)</Label>
              <div id="breakTimeContainer" className="space-y-2">
                <div className="flex items-center gap-3 break-row">
                  <Input type="time" name="breakStart" placeholder="Start" className="w-full" />
                  <Input type="time" name="breakEnd" placeholder="End" className="w-full" />
                  <Button type="button" variant="ghost" onClick={(e) => e.target.closest(".break-row").remove()}>
                    Remove
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const container = document.getElementById("breakTimeContainer");
                  const row = document.createElement("div");
                  row.className = "flex items-center gap-3 break-row";
                  row.innerHTML = `
              <input type="time" name="breakStart" class="w-full border border-gray-300 rounded-md p-2" />
              <input type="time" name="breakEnd" class="w-full border border-gray-300 rounded-md p-2" />
              <button type="button" class="text-red-500 hover:underline">Remove</button>
            `;
                  row.querySelector("button").onclick = () => row.remove();
                  container.appendChild(row);
                }}
              >
                + Add Break
              </Button>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSchedule(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
              >
                Add Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Schedule Dialog */}
      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-lg p-6 shadow-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold text-gray-800">Edit Schedule</DialogTitle>
            <DialogDescription className="text-gray-500">Update the doctor's schedule.</DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const date = selectedSchedule.date;

                const breakTime = Array.from(document.querySelectorAll(".edit-break-row"))
                  .map((row) => {
                    const start = row.querySelector('[name="breakStart"]').value;
                    const end = row.querySelector('[name="breakEnd"]').value;
                    return start && end
                      ? {
                        start: `${date?.split('T')[0]}T${row.querySelector('[name="breakStart"]').value}:00+05:30`,
                end: `${date?.split('T')[0]}T${row.querySelector('[name="breakEnd"]').value}:00+05:30`,
                      }
                      : null;
                  })
                  .filter(Boolean);

                const updatedSchedule = {
                  ...selectedSchedule,
                  doctorId: formData.get("doctorId"),
                  doctorName:
                    doctors.find((doc) => doc?._id === formData.get("doctorId"))?.name || selectedSchedule.doctorName,
                  startTime: `${date?.split('T')[0]}T${formData.get("startTime")}:00+05:30`,
                  endTime: `${date?.split('T')[0]}T${formData.get("endTime")}:00+05:30`,
                  slotDuration: parseInt(formData.get("slotDuration")),
                  breakTime,
                };

                handleUpdateSchedule(updatedSchedule);
              }}
              className="space-y-4"
            >
              {/* Doctor Selection */}
              <div className="grid gap-3">
                <Label htmlFor="doctorId" className="text-gray-700 font-medium">Doctor</Label>
                <select
                  name="doctorId"
                  defaultValue={selectedSchedule.doctorId}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300"
                >
                  {doctors
                    .filter((doc) => doc.status === "active")
                    .map((doctor) => (
                      <option key={doctor?._id} value={doctor?._id}>
                        {doctor.id} - {doctor.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Start Time */}
              <div className="grid gap-3">
                <Label htmlFor="startTime" className="text-gray-700 font-medium">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  defaultValue={selectedSchedule.startTime?.substring(11, 16)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* End Time */}
              <div className="grid gap-3">
                <Label htmlFor="endTime" className="text-gray-700 font-medium">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  required
                  defaultValue={selectedSchedule.endTime?.substring(11, 16)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* Slot Duration */}
              <div className="grid gap-3">
                <Label htmlFor="slotDuration" className="text-gray-700 font-medium">Slot Duration (minutes)</Label>
                <Input
                  id="slotDuration"
                  name="slotDuration"
                  type="number"
                  min="1"
                  required
                  defaultValue={selectedSchedule.slotDuration}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* Break Time(s) */}
              <div className="grid gap-3">
                <Label className="text-gray-700 font-medium">Break Time(s)</Label>
                <div id="editBreakTimeContainer" className="space-y-2">
                  {selectedSchedule.breakTime?.map((bt, index) => {
                    const start = new Date(bt.start).toISOString().substring(11, 16);
                    const end = new Date(bt.end).toISOString().substring(11, 16);
                    return (
                      <div key={index} className="flex items-center gap-3 edit-break-row">
                        <Input type="time" name="breakStart" defaultValue={start} className="w-full" />
                        <Input type="time" name="breakEnd" defaultValue={end} className="w-full" />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => e.target.closest(".edit-break-row").remove()}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const container = document.getElementById("editBreakTimeContainer");
                    const row = document.createElement("div");
                    row.className = "flex items-center gap-3 edit-break-row";
                    row.innerHTML = `
                <input type="time" name="breakStart" class="w-full border border-gray-300 rounded-md p-2" />
                <input type="time" name="breakEnd" class="w-full border border-gray-300 rounded-md p-2" />
                <button type="button" class="text-red-500 hover:underline">Remove</button>
              `;
                    row.querySelector("button").onclick = () => row.remove();
                    container.appendChild(row);
                  }}
                >
                  + Add Break
                </Button>
              </div>

              {/* Status */}
              {/* <div className="grid gap-3">
                <Label htmlFor="status" className="text-gray-700 font-medium">Status</Label>
                <select
                  name="status"
                  defaultValue={selectedSchedule.status}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div> */}

              {/* Footer Buttons */}
              <DialogFooter className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSchedule(null)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                >
                  Update Schedule
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}

