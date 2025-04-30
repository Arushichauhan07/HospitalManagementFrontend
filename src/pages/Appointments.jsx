import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/UI/Card"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns"
import Button from "../components/UI/Button"
import Input from "../components/UI/Input"
import Label from "../components/UI/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/UI/Tabs"
import Textarea from "../components/UI/TextArea"
import Badge from "../components/UI/Badge"
import { useSelector } from "react-redux"
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCheck,
  AlertCircle,
  Clock3,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/UI/DropMenu"
import Progress from "../components/UI/Progress"
import { cn } from "../components/Lib/Utilis"
import { useCreateAppointmentMutation, useDeleteAppointmentMutation, useGetAppointmentsQuery, useUpdateAppointmentMutation } from "../redux/slices/appointmentsSlice"
import { useGetDoctorsQuery } from "../redux/slices/doctorSlice"
import { useGetPatientsQuery } from "../redux/slices/patientSlice"
import { useGetSchedulesByDoctorQuery } from "../redux/slices/schedule"
import { toast } from "react-toastify"
import { useFetchLoggedInUserQuery } from "../redux/slices/authSlice";
import {socket} from "../components/hooks/useInitSocket";
import { useCreateNotificationsMutation } from "../redux/slices/notificationSlice";
import { downloadPdf } from '../components/utilis/DownloadPdfs';
import useFormattedDate from "../components/hooks/useFormattedDate";

export default function Appointments() {
  const { data: appointmentData } = useGetAppointmentsQuery();
  const { data } = useGetDoctorsQuery();
  const { data: patientsData } = useGetPatientsQuery();
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [seletcedPatient, setSelectedPatient] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeEditSlots, setTimeEditSlots] = useState([]);
  const [editSlotTime, setEditSlotTime] = useState("");
  const [editStatus, setEditStatus] = useState("");

  
console.log("appointmentData", appointmentData)
  const { data: schedulesData, isLoading, error } = useGetSchedulesByDoctorQuery(selectedDoctor?._id, {
    skip: !selectedDoctor,
  });
  const [createAppointment] = useCreateAppointmentMutation();

  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();

  const [patientsList, setPatientsList] = useState(patientsData?.data || []);
  const [doctors, setDoctors] = useState(data?.data || []);
  // const timeSlots = generateTimeSlots()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))
  const { data: logInUser } = useFetchLoggedInUserQuery();
  const [createNotification] = useCreateNotificationsMutation();
  const formatDate = useFormattedDate()

  useEffect(() => {
    if (data) {
      setDoctors(data.data.filter((doctor) => doctor?.role_id?.role_name === "Doctor"));
    }
  }, [data]);
  useEffect(() => {
    if (patientsData) {
      setPatientsList(patientsData.data);
    }
  }, [patientsData]);

  // When a date is selected, extract its time slots
  useEffect(() => {
    if (selectedDate && schedulesData?.data) {
      const schedule = schedulesData.data.find(s => s.date.split("T")[0] === selectedDate);
      if (schedule) {
        setSelectedSchedule(schedule);
        const availableSlots = schedule.slots
          .filter(slot => slot.status === "available")
          .map(slot => new Date(slot.time).toISOString().split("T")[1].slice(0, 5)); // HH:MM format
        setTimeSlots(availableSlots);
      }
    }
  }, [selectedDate, schedulesData]);
  useEffect(() => {
    if (selectedDate && schedulesData?.data) {
      const schedule = schedulesData.data.find(s => s.date.split("T")[0] === selectedDate);
      if (schedule) {
        setSelectedSchedule(schedule);
        const availableSlots = schedule.slots
          .map(slot => new Date(slot.time).toISOString().split("T")[1].slice(0, 5)); // HH:MM format
        setTimeEditSlots(availableSlots);
      }
    }
  }, [selectedDate, schedulesData]);
  useEffect(() => {
    if (selectedAppointment) {
      const date = new Date(selectedAppointment.slotTime).toISOString().split("T")[0];
      setSelectedDate(date);
    }
  }, [selectedAppointment]);

  useEffect(() => {
    if (selectedAppointment && doctors.length > 0) {
      const foundDoctor = doctors.find(doc => doc._id === selectedAppointment.doctorId);
      setSelectedDoctor(foundDoctor || null);
    }
  }, [selectedAppointment, doctors]);
  useEffect(() => {
    if (selectedAppointment?.patientId && patientsList.length > 0) {
      const foundPatient = patientsList.find(patient => patient._id === selectedAppointment.patientId);
      setSelectedPatient(foundPatient || null);
    }
  }, [selectedAppointment, patientsList]);

  useEffect(() => {
    if (selectedAppointment) {
      const parsedTime = new Date(selectedAppointment.slotTime)
        .toISOString()
        .split("T")[1]
        .slice(0, 5); // HH:MM
      setEditSlotTime(parsedTime);
      setEditStatus(selectedAppointment.status || "");
    }
  }, [selectedAppointment]);


  // Generate week dates
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeek, i))

  // Navigate to next/previous week
  const goToPreviousWeek = () => setSelectedWeek(subWeeks(selectedWeek, 1))
  const goToNextWeek = () => setSelectedWeek(addWeeks(selectedWeek, 1))
  const goToCurrentWeek = () => setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 0 }))

  // Filter appointments for the calendar view
  const getAppointmentsForDay = (date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return appointmentData?.data.filter((appointment) => appointment.date === dateString)
  }


  // Handle adding a new appointment
  const handleAddAppointment = async (newAppointment) => {
    try {
      const response = await createAppointment(newAppointment).unwrap();
       
      if(response.success === true){
              socket.emit("appointment-scheduled", {
                to: response.data.doctorId,
                message: "appointment assigned to you",
                date: new Date(),
                notDesc: response.data.slotTime
              })
      
              await createNotification({
                sender: logInUser._id, // doctor ID
                receiver: response.data.doctorId,
                message: "An appointment has been scheduled for you.",
                notDesc: response.data.slotTime,
              });
            }
    
      setShowAddAppointment(false);
      toast.success("Appointment created successfully!");
    } catch (err) {
      // console.error("Failed to create appointment:", err);
      toast.error("Failed to create appointment");
    }
  };
  // Handle updating an appointment
  const handleUpdateAppointment = async (updatedAppointment) => {
    try {
      // Ensure you use _id or convert it to id
      const id = updatedAppointment._id || updatedAppointment.id;
      if (!id) {
        throw new Error("Appointment ID is missing");
      }

      // Optional doctor name logic
      if (updatedAppointment.doctorId !== selectedAppointment?.doctorId) {
        const doctor = doctors.find((d) => d.id === updatedAppointment.doctorId);
        updatedAppointment.doctorName = doctor ? doctor.name : updatedAppointment.doctorName;
      }

      // Send to backend
      const response = await updateAppointment({ id, ...updatedAppointment }).unwrap();


      setSelectedAppointment(null);
    } catch (error) {
      // console.error("Failed to update appointment:", error);
    }
  };


  // Handle deleting an appointment
  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id).unwrap(); // call the backend delete
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      // console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  // Handle changing appointment status
  const handleChangeStatus = (id, newStatus) => {
    setAppointments(appointments?.map((app) => (app.id === id ? { ...app, status: newStatus } : app)))
  }
  const handleDoctorChange = (value) => {
    // console.log("Selected doctor:", value);
    const selected = doctors.find((doc) => doc._id === value);
    setSelectedDoctor(selected || null);
  };

  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === "dark";

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const appointments = appointmentData?.data || []
  const totalPages = Math.ceil(appointments.length / itemsPerPage);

  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter appointments based on search query
  const filteredAppointments = paginatedAppointments.filter((appointment) => {
    const query = searchQuery.toLowerCase();
  
    return (
      appointment?.id?.toLowerCase().includes(query) ||
      appointment?.status?.toLowerCase().includes(query) ||
      appointment?.patientId?.name.toLowerCase().includes(query) ||
      appointment?.doctorId?.name.toLowerCase().includes(query)
    );
  });

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => setShowAddAppointment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments by patient or doctor..."
            className="pl-8 w-full border-2 border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.trimStart())}
          />
        </div>
        {/* <Button variant="outline" size="icon" className="ml-2">
          <Filter className="h-4 w-4" />
        </Button> */}
        <Button 
        variant="outline" 
        size="sm" 
        className="ml-2"
        onClick={() => {
          const headers = ["ID", "Patient", "Doctor", "Date & Time", "Status"];
          const exportData = appointmentData?.data.map((app) => [
            app.id,
            app.patientId.name,
            app.doctorId.name,
            formatDate(app.slotTime),
            app.status,
            ]);               
            downloadPdf({
              title: "Appointments",
              headers,
              data: exportData,
              fileName: "appointment_file.pdf",
              });
            }}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="list" className="mb-6">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          {/* <TabsTrigger value="calendar" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Calendar View
          </TabsTrigger> */}
          <TabsTrigger value="list" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            List View
          </TabsTrigger>
          {/* <TabsTrigger value="telemedicine" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Telemedicine
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {format(selectedWeek, "MMMM d, yyyy")} - {format(addDays(selectedWeek, 6), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {weekDays?.map((day, i) => (
                  <div key={i} className="text-center p-2 font-medium">
                    <div>{format(day, "EEE")}</div>
                    <div
                      className={cn(
                        "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm",
                        isSameDay(day, new Date()) ? "bg-teal-500 text-white" : "",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                ))}

                {/* Appointment slots */}
                {weekDays?.map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-md h-[500px] overflow-y-auto relative">
                    <div className="sticky top-0 bg-background z-10 border-b">
                      <div className="text-center py-1 text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                    </div>
                    <div className="px-1">
                      {getAppointmentsForDay(day)?.map((appointment, i) => (
                        <div
                          key={i}
                          className={cn(
                            "my-1 p-2 rounded-md text-xs cursor-pointer",
                            appointment.status === "confirmed"
                              ? "bg-teal-100"
                              : appointment.status === "pending"
                                ? "bg-amber-100"
                                : "bg-red-100",
                          )}
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <div className="font-medium truncate">{appointment.time}</div>
                          <div className="truncate">{appointment.patientName}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{appointment.doctorName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="md:grid grid-cols-4 gap-4 mb-6 block">
              <Card className="ring ring-blue-200">
                  <CardContent className="p-4 flex items-center gap-4 pt-5">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-500 " />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-500">Total</p>
                      <p className="text-2xl font-bold">{appointmentData?.data.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-200 ">
                  <CardContent className="p-4 flex items-center gap-4 pt-5">
                    <div className="p-3 rounded-full">
                      <CheckCheck className="h-6 w-6 text-green-500 " />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-500 ">Confirmed</p>
                      <p className="text-2xl font-bold">
                        {paginatedAppointments.filter((a) => a.status === "confirmed").length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="ring ring-amber-200">
                <CardContent className="p-4 flex items-center gap-4 pt-5">
                    <div className="bg-amber-100  p-3 rounded-full">
                      <Clock3 className="h-6 w-6 text-amber-500 " />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-500">Pending</p>
                      <p className="text-2xl font-bold">{paginatedAppointments.filter((a) => a.status === "pending").length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-rose-200">
                <CardContent className="p-4 flex items-center gap-4 pt-5">
                    <div className="bg-rose-100 p-3 rounded-full">
                      <AlertCircle className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-500">Today</p>
                      <p className="text-2xl font-bold">
                        {paginatedAppointments.filter((a) => a.slotTime === format(new Date(), "yyyy-MM-dd")).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment?.id || appointment?._id}</TableCell>
                      <TableCell>{appointment.patientId?.name}</TableCell>
                      <TableCell>{appointment.doctorId?.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{appointment.slotTime.split("T")[0]}</span>
                          <span className="text-xs text-muted-foreground">
                           Time - {appointment.slotTime.split("T")[1].split(":")[0] + ":" + appointment.slotTime.split("T")[1].split(":")[1]}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>
                      <Badge
                        className={cn(
                          appointment.status === "confirmed"
                            ? isDark
                              ? "bg-green-900 text-green-300"
                              : "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                              ? isDark
                                ? "bg-amber-900 text-amber-300"
                                : "bg-amber-100 text-amber-800"
                              : isDark
                                ? "bg-rose-900 text-rose-300"
                                : "bg-rose-100 text-rose-800"
                        )}
                      >
                      {appointment.status}
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
                            <DropdownMenuItem onClick={() => {
                              setSelectedAppointment(appointment)
                              // console.log(selectedAppointment)
                              // console.log(appointment)

                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAppointment(appointment._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {appointment.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(appointment.id, "confirmed")}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {appointment.status === "confirmed" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(appointment.id, "cancelled")}>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
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

        {appointments.length >= 5 && (
                <div className="border-t border-gray-200 py-4 flex items-center justify-between px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-500 hover:text-teal-600"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-500 hover:text-teal-600"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}

        {/* <TabsContent value="telemedicine" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Virtual Appointments</CardTitle>
              <CardDescription>Manage telemedicine and virtual consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">Today's Virtual Appointments</h3>
                        <p className="text-3xl font-bold mt-2">3</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Next: 11:30 AM
                      </Badge>
                    </div>
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">Join Next Meeting</Button>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">Completed Today</h3>
                        <p className="text-3xl font-bold mt-2">2</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        100% Success
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Session Reports
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">System Status</h3>
                        <p className="text-sm mt-2">All systems operational</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-4">
                      <span>Video Quality:</span>
                      <span className="font-medium">Excellent</span>
                    </div>
                    <Progress value={95} className="h-2 mt-1" />
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Ahmed Mohamed</div>
                      <div className="text-xs text-muted-foreground">P-10045</div>
                    </TableCell>
                    <TableCell>11:30 AM - 12:00 PM</TableCell>
                    <TableCell>Dr. Sara Hassan</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 ">Upcoming</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                        Start Session
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Fatima Ali</div>
                      <div className="text-xs text-muted-foreground">P-10046</div>
                    </TableCell>
                    <TableCell>1:00 PM - 1:30 PM</TableCell>
                    <TableCell>Dr. Ahmed Ali</TableCell>
                    <TableCell>Consultation</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                        Start Session
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Omar Khaled</div>
                      <div className="text-xs text-muted-foreground">P-10047</div>
                    </TableCell>
                    <TableCell>3:00 PM - 3:30 PM</TableCell>
                    <TableCell>Dr. Mostafa Aita</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                        Start Session
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Layla Ibrahim</div>
                      <div className="text-xs text-muted-foreground">P-10048</div>
                    </TableCell>
                    <TableCell>9:30 AM - 10:00 AM</TableCell>
                    <TableCell>Dr. Shahd Ali</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Youssef Mahmoud</div>
                      <div className="text-xs text-muted-foreground">P-10049</div>
                    </TableCell>
                    <TableCell>10:15 AM - 10:45 AM</TableCell>
                    <TableCell>Dr. Ahmed Ali</TableCell>
                    <TableCell>Consultation</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>Create a new appointment for a patient</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const type = formData.get("type");
              const notes = formData.get("notes");

              const newAppointment = {
                patient: formData.get("patientId"),
                doctorId: formData.get("doctorId"),
                date: selectedSchedule?.date.split("T")[0],
                slotTime: formData.get("slotTime"),
                reason: notes ? `Type: ${type} \n Notes: ${notes}` : type,
                scheduleId: selectedSchedule?._id,
              };

              handleAddAppointment(newAppointment);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* Patient */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientId" className="text-right">
                  Patient
                </Label>
                <select
                  id="patientId"
                  name="patientId"
                  required
                  className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Patient</option>
                  {patientsList?.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      ({patient.id}) - {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorId" className="text-right">
                  Doctor
                </Label>
                <Select value={selectedDoctor?._id || ""} onValueChange={handleDoctorChange}>
                  <SelectTrigger className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors
                      .filter((doc) => doc.status === "active")
                      .map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.id} - {doctor.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="doctorId" value={selectedDoctor?._id || ""} />
              </div>


              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Select name="date" required onValueChange={(value) => setSelectedDate(value)}>
                  <SelectTrigger className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedulesData?.data?.map((s) => (
                      <SelectItem key={s._id} value={s.date.split("T")[0]}>
                        {s.date.split("T")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slotTime" className="text-right">
                  Time
                </Label>
                <Select name="slotTime" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots?.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select name="type" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Checkup">Checkup</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>


            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddAppointment(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Appointment Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (() => {
            // Extract time string from slotTime
            // const parsedTime = new Date(selectedAppointment.slotTime)
            // .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            const parsedTime = (selectedAppointment.slotTime.split(":")[0] + ":" + selectedAppointment.slotTime.split(":")[1]).split("T")[1];
            // console.log(parsedTime);
            // console.log(parsedTime.split("T")[1]);

            // Extract type and notes from reason
            const [typeLine = "", notesLine = ""] = selectedAppointment.reason?.split("\n") || [];
            const extractedType = typeLine.replace("Type: ", "").trim();
            const extractedNotes = notesLine.replace("Notes: ", "").trim();

            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const type = formData.get("type");
                  const notes = formData.get("notes");

                  const updatedAppointment = {
                    _id: selectedAppointment._id,
                    patientId: formData.get("patientId"),
                    doctorId: selectedDoctor?._id,
                    scheduleId: selectedSchedule?._id,
                    date: selectedDate,
                    slotTime: formData.get("slotTime"),
                    reason: notes ? `Type: ${type} \n Notes: ${notes}` : type,
                    status: formData.get("status"),
                  };

                  handleUpdateAppointment(updatedAppointment);
                }}
              >
                <div className="grid gap-4 py-4">
                  {/* Patient */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-patientId" className="text-right">Patient</Label>
                    <select
                      id="edit-patientId"
                      name="patientId"
                      required
                      className="col-span-3 border rounded-md px-3 py-2"
                      defaultValue={seletcedPatient?._id}
                    >
                      <option value="">Select Patient</option>
                      {patientsList?.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          ({patient.id}) - {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-doctorId" className="text-right">Doctor</Label>
                    <select
                      id="edit-doctorId"
                      name="doctorId"
                      required
                      value={selectedDoctor?._id || ""}
                      onChange={(e) => {
                        const doc = doctors.find((d) => d._id === e.target.value);
                        setSelectedDoctor(doc || null);
                      }}
                      defaultValue={selectedAppointment.doctorId}
                      className="col-span-3 border rounded-md px-3 py-2"
                    >
                      <option value="">Select Doctor</option>
                      {doctors?.filter((doc) => doc.status === "active").map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.id} - {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-date" className="text-right">Date</Label>
                    <Select name="date" value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {schedulesData?.data?.map((s) => (
                          <SelectItem key={s._id} value={s.date.split("T")[0]}>
                            {s.date.split("T")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-slotTime" className="text-right">Time</Label>
                    <Select name="slotTime" defaultValue={parsedTime}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={parsedTime}>{parsedTime}</SelectItem>
                        {timeSlots?.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-type" className="text-right">Type</Label>
                    <Select name="type" defaultValue={extractedType}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                        <SelectItem value="Checkup">Checkup</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-status" className="text-right">Status</Label>
                    <Select name="status" defaultValue={selectedAppointment.status}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-notes" className="text-right pt-2">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      name="notes"
                      defaultValue={extractedNotes}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSelectedAppointment(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                    Update
                  </Button>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>




    </>
  )
}

