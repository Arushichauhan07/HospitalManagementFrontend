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
  FileText,
  Users,
  Mail,
  Activity,
  Bed,
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
import { useAddMedicalHistoryMutation, useAddPatientMutation, useGetPatientsQuery } from "../redux/slices/patientSlice";
import { useSelector } from "react-redux"
import Textarea from "../components/UI/TextArea"
import { useGetDoctorsQuery } from "../redux/slices/doctorSlice"
import { toast } from "react-toastify"
import { downloadPdf } from '../components/utilis/DownloadPdfs';
import useFormattedDate from '../components/hooks/useFormattedDate';

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tabValue, setTabValue] = useState("patients");
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [PatientSelected, setPatientSelected] = useState(null)
  const [showMedicalRecord, setShowMedicalRecord] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const { data: patientsData, error, isLoading } = useGetPatientsQuery();
  const { data: doctorsData } = useGetDoctorsQuery();
  const [addMedicalHistory] = useAddMedicalHistoryMutation();
  const [addPatient] = useAddPatientMutation();
  const formatDate = useFormattedDate();
  
  const { mode } = useSelector((state) => state.theme);

  // console.log("data", patientsData)
  // Sample data for patients
  const [patients, setPatients] = useState(patientsData?.data || [])
  const [doctorsList, setDoctorsList] = useState(doctorsData?.data || []);

  // console.log("patients", patients)

  // Sample data for medical records
  const [medicalRecords, setMedicalRecords] = useState([])

  // console.log("medicalRecords", medicalRecords)

  // Filter patients based on search query
  const filteredPatients = patientsData?.data.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      patient.bloodGroup?.toLowerCase().includes(searchQuery?.toLowerCase()),
  )

  // Filter medical records based on search query
  const filteredRecords = medicalRecords?.filter(
    (record) =>
      record?.patientName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      record?.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      record?.diagnosis?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      record?.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    if (!doctorsData?.data) return

    setDoctorsList(doctorsData?.data.filter((doctor) => doctor?.role_id?.role_name === "Doctor"))
  }, [doctorsData])

  useEffect(() => {
    if (!patientsData?.data) return;

    setPatients(patientsData.data);

    const flattenedHistories = patientsData.data.flatMap((patient) =>
      patient.medicalHistory.map((record) => ({
        ...record,
        patientId: patient._id,
        id: patient.id,
        patientName: patient.name,
      }))
    );

    // console.log("Flattened medicalRecords with patient info:", flattenedHistories);
    setMedicalRecords(flattenedHistories);
  }, [patientsData]);

  // Add new patient
  const handleAddPatient = async (newPatient) => {
    try {
      const res = await addPatient(newPatient).unwrap();
      toast.success("Patient registered successfully");
      
      setPatients((prev) => [...prev, res.data]); // assuming API returns new patient in res.data
      setShowAddPatient(false);
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast.error(error?.data?.error || "Failed to register patient");
    }
  };



  // Update patient
  const handleUpdatePatient = (updatedPatient) => {
    setPatients(patientsData?.data.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient)))
    setSelectedPatient(null)
  }

  // Delete patient
  const handleDeletePatient = (id) => {
    setPatients(patientsData?.data.filter((patient) => patient.id !== id))
    // Also delete associated medical records
    setMedicalRecords(medicalRecords.filter((record) => record.patientId !== id))
  }

  // Add new medical record
  const handleAddMedicalRecord = async (newRecord) => {
    try {
      const { patientId, ...historyData } = newRecord;
      const response = await addMedicalHistory({ id: patientId, historyData }).unwrap();

      // console.log("Medical history added:", response);

      setMedicalRecords((prev) => [
        ...prev,
        response,
      ]);

      setShowMedicalRecord(false);
      setPatientSelected(null);
      toast.success("Medical record added successfully!");

    } catch (error) {
      console.error("Failed to add medical record:", error);
      toast.error("Failed to add medical record");
    }
  };

  // Update medical record
  const handleUpdateMedicalRecord = (updatedRecord) => {
    setMedicalRecords(medicalRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    setSelectedRecord(null)
  }

  // Delete medical record
  const handleDeleteMedicalRecord = (id) => {
    setMedicalRecords(medicalRecords.filter((record) => record.id !== id))
  }

  return (
    <>
     <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
          <Button className="bg-teal-500 hover:bg-teal-600 w-full sm:w-auto" onClick={() => setShowMedicalRecord(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Add Medical Record
          </Button>
          <Button className="bg-teal-500 hover:bg-teal-600 w-full sm:w-auto" onClick={() => setShowAddPatient(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Patient
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Patient Portal Access</CardTitle>
            <CardDescription>Manage patient access to the online portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200 p-2">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Active Users</h3>
                      <p className="text-3xl font-bold mt-2">{patientsData?.data.filter((patient) => patient.status === "InConsultation").length}</p>
                    </div>
                    <div className="bg-green-100  p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-500 " />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200 p-2">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Admitted Patients</h3>
                      <p className="text-3xl font-bold mt-2">{patientsData?.data.filter((patient) => patient.status === "Admitted").length}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Bed className="h-5 w-5 text-blue-500" />
                      {/* <Mail className="h-5 w-5 text-blue-500" /> */}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200 p-2">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Portal Activity</h3>
                      <p className="text-3xl font-bold mt-2">67%</p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients or medical records..."
            className="pl-8 w-full border border-gray-200 p-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Button variant="outline" size="icon" className="ml-2">
          <Filter className="h-4 w-4" />
        </Button> */}
        <Button variant="outline" size="sm" className="ml-2"
        onClick={() => {
                  if (tabValue === "patients") {
                  const headers = ["Id", "Name", "Age/Gender", "Blood Type", "Contact", "status"];
                  const exportData = patients?.map((patient) => [
                    patient.id,
                    patient.name,
                    patient.gender,
                    patient.bloodGroup,
                    patient.phone,
                    patient.status,
                  ]);
        
                  downloadPdf({
                    title: "Patient Data",
                    headers,
                    data: exportData,
                    fileName: "patient_data.pdf",
                  });
                } else if (tabValue === "records") {
                const headers = ["Id", "Patient", "Diagnosis", "Doctor", "Date"];
                const exportData = medicalRecords?.map((records) => [
                records?.id,
                records?.patientName,
                records?.diagnosis,
                records?.doctor.name,
                formatDate(records.date),
              ]);
        
              downloadPdf({
                title: "Room Assignments",
                headers,
                data: exportData,
                fileName: "room_assignments.pdf",
              });
            }
            }}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="patients" value={tabValue} onValueChange={setTabValue} className="mb-6">
        <TabsList className="bg-teal-100 inline-flex h-10 items-center justify-center rounded-md text-gray-500">
          <TabsTrigger value="patients" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Patient Directory
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Medical Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Patient Directory</CardTitle>
              <CardDescription>Complete list of registered patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients?.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback>{patient?.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{patient?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p>{patient?.dateOfBirth ? Math.floor((new Date() - new Date(patient?.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : "N/A"}/ {patient?.gender}</p>
                      </TableCell>
                      <TableCell>{patient?.bloodGroup}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{patient?.email}</span>
                          <span className="text-xs text-muted-foreground">{patient?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            patient?.status === "active"
                              ? mode === "dark"
                                ? "bg-green-900 text-green-300"
                                : "bg-green-100 text-green-800"
                              : mode === "dark"
                                ? "bg-amber-900 text-amber-300"
                                : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {patient?.status}
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
                            <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePatient(patient?._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setShowMedicalRecord(true)
                                // Pre-select this patient for medical record
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Add Medical Record
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

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Patient medical history and diagnoses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    {/* <TableHead>Follow-up</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.patientName}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start text-gray-800">
                          <span className="text-xs text-gray-500">({record?.doctor?.id})</span>
                          <span className="text-sm">{record?.doctor?.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>{record.date.split('T')[0]}</TableCell>
                      {/* <TableCell>{record.followUp}</TableCell> */}
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
                            <DropdownMenuItem onClick={() => setSelectedRecord(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteMedicalRecord(record.id)}>
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
      {/* Add Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register Patient</DialogTitle>
            <DialogDescription>Enter the details of the new patient.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newPatient = {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                dateOfBirth: formData.get("dateOfBirth"),
                gender: formData.get("gender"),
                address: formData.get("address"),
                doctorAssigned: formData.get("doctorAssigned"),
                bloodGroup: formData.get("bloodGroup"),
                patientType: formData.get("patientType"),
              };
              handleAddPatient(newPatient);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">Gender</Label>
                <Select name="gender" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateOfBirth" className="text-right">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bloodGroup" className="text-right">Blood Group</Label>
                <Select name="bloodGroup" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Input id="address" name="address" className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientType" className="text-right">Patient Type</Label>
                <Select name="patientType" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Telemedicine">Telemedicine</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorAssigned" className="text-right">Doctor</Label>
                <Select name="doctorAssigned" required>
                  <SelectTrigger className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsList.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        ({doctor.id}) {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddPatient(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Register Patient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Patient Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update the details of the patient.</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updatedPatient = {
                  ...selectedPatient,
                  name: formData.get("name"),
                  gender: formData.get("gender"),
                  age: Number.parseInt(formData.get("age")),
                  bloodType: formData.get("bloodType"),
                  phone: formData.get("phone"),
                  email: formData.get("email"),
                  address: formData.get("address"),
                  status: formData.get("status"),
                }
                handleUpdatePatient(updatedPatient)
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
                    defaultValue={selectedPatient.name}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-gender" className="text-right">
                    Gender
                  </Label>
                  <Select name="gender" defaultValue={selectedPatient.gender}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-age" className="text-right">
                    Age
                  </Label>
                  <Input
                    id="edit-age"
                    name="age"
                    type="number"
                    min="0"
                    defaultValue={selectedPatient.age}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-bloodType" className="text-right">
                    Blood Type
                  </Label>
                  <Select name="bloodType" defaultValue={selectedPatient.bloodType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    defaultValue={selectedPatient.phone}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedPatient.email}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="edit-address"
                    name="address"
                    defaultValue={selectedPatient.address}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select name="status" defaultValue={selectedPatient.status}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedPatient(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Patient
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showMedicalRecord} onOpenChange={setShowMedicalRecord}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Medical History</DialogTitle>
            <DialogDescription>Update patient's medical record</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newEntry = {
                patientId: formData.get("patientId"),
                visit: formData.get("visit"),
                diagnosis: formData.get("diagnosis"),
                treatment: formData.get("treatment"),
                doctor: formData.get("doctorId"),
              };
              handleAddMedicalRecord(newEntry);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Patient" className="text-right">
                  Patient
                </Label>
                <Select name="patientId" onValueChange={
                  (value) => {
                    const selectedPatient = patientsData?.data?.find((patient) => patient._id === value);

                    // console.log("selectedPatient", selectedPatient)
                    setPatientSelected(selectedPatient);
                  }
                }>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsData?.data?.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.id} - ({patient.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              {/* Visit */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="visit" className="text-right">
                  Visit
                </Label>
                <Select name="visit">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PatientSelected?.visitDates?.map((visit) => (
                      <SelectItem key={visit._id} value={visit._id}>
                        ({visit.date.split("T")[0]}) - {visit.notes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diagnosis */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diagnosis" className="text-right">
                  Diagnosis
                </Label>
                <Input
                  id="diagnosis"
                  name="diagnosis"
                  required
                  className="col-span-3"
                  placeholder="e.g. Hypertension"
                />
              </div>

              {/* Treatment */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="treatment" className="text-right">
                  Treatment
                </Label>
                <Textarea
                  id="treatment"
                  name="treatment"
                  rows={3}
                  required
                  className="col-span-3"
                  placeholder="e.g. Medication, lifestyle changes"
                />
              </div>

              {/* Doctor */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorId" className="text-right">
                  Doctor
                </Label>
                <select
                  id="doctorId"
                  name="doctorId"
                  required
                  className="col-span-3 border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Doctor</option>
                  {doctorsList?.map((doc) => (

                    (doc.status === "active") && (<option key={doc._id} value={doc._id}>
                      {doc.name} - ({doc.id})
                    </option>)
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddHistory(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                Add History
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Medical Record Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>Update the medical record details.</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const patientId = formData.get("patientId")
                const patient = patients.find((p) => p.id === patientId)
                const medications = formData
                  .get("medications")
                  .split(",")
                  .map((med) => med.trim())

                const updatedRecord = {
                  ...selectedRecord,
                  patientId: patientId,
                  patientName: patient ? patient.name : selectedRecord.patientName,
                  diagnosis: formData.get("diagnosis"),
                  doctor: formData.get("doctor"),
                  notes: formData.get("notes"),
                  medications: medications,
                  followUp: formData.get("followUp"),
                }
                handleUpdateMedicalRecord(updatedRecord)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-patientId" className="text-right">
                    Patient
                  </Label>
                  <Select name="patientId" defaultValue={selectedRecord.patientId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsData?.data?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-diagnosis" className="text-right">
                    Diagnosis
                  </Label>
                  <Input
                    id="edit-diagnosis"
                    name="diagnosis"
                    defaultValue={selectedRecord.diagnosis}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-doctor" className="text-right">
                    Doctor
                  </Label>
                  <Input
                    id="edit-doctor"
                    name="doctor"
                    defaultValue={selectedRecord.doctor}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="edit-notes"
                    name="notes"
                    defaultValue={selectedRecord.notes}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-medications" className="text-right">
                    Medications
                  </Label>
                  <Input
                    id="edit-medications"
                    name="medications"
                    defaultValue={selectedRecord.medications.join(", ")}
                    className="col-span-3"
                    placeholder="Separate with commas"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-followUp" className="text-right">
                    Follow-up Date
                  </Label>
                  <Input
                    id="edit-followUp"
                    name="followUp"
                    defaultValue={selectedRecord.followUp}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedRecord(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  Update Record
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

