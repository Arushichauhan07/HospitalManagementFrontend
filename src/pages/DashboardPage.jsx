import { useEffect, useState } from "react";
import { BarChart4, Calendar, Users, Bed, Activity, Pill, Stethoscope, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Clock, UserCheck, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import FinancialOverview from "../components/DashboardWidgets/FinancialOverview"
import PatientPortal from "../components/DashboardWidgets/PatientPortal";
import Appointments from "../components/DashboardWidgets/Appointments";
import DepartmentStatus from "../components/DashboardWidgets/DepartmentStatus";
import InventoryAlerts from "../components/DashboardWidgets/InventortAlert";
import Header from "../components/Header";
import { useGetPatientsQuery } from "../redux/slices/patientSlice";
import { useGetAppointmentsQuery } from "../redux/slices/appointmentsSlice";
import { useGetAllOperationsQuery } from "../redux/slices/operationSlice";
import { useGetRoomsQuery } from "../redux/slices/roomSlice";
import axios from "axios";
import { useSelector } from "react-redux";
import { useGetRolePermissionsQuery } from "../redux/slices/roleSlice";



const Dashboard = () => {
  const [showReports, setShowReports] = useState(false);
  const { data: patientsData, error, isLoading } = useGetPatientsQuery();
  const { data: appointmentData } = useGetAppointmentsQuery();
  const { data: operationsData } = useGetAllOperationsQuery();
  const { data: roomsData } = useGetRoomsQuery();
  const { data : permissionsData } = useGetRolePermissionsQuery();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [insights, setInsights] = useState({
    patientReadmissionRisk: "Loading.......",
    medicationOptimization: "Loading.......",
    staffScheduling: "Loading.......",
    emergencyCaseTrends: "Loading.......",
    bedOccupancyRate: "Loading.......",
    doctorPatientRatio: "Loading.......",
    appointmentTrends: "Loading.......",
    financialImpact: "Loading.......",
});
const { mode } = useSelector((state) => state.theme);
const { role } = useSelector((state) => state.role);

// console.log("role", role)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get(`${apiUrl}/insights/predict-insights`);
        // console.log("Fetched Insights:", response.data);
        const cleanedData = {
          patientReadmissionRisk: cleanText(response.data.insights.patientReadmissionRisk),
          medicationOptimization: cleanText(response.data.insights.medicationOptimization),
          staffScheduling: cleanText(response.data.insights.staffScheduling),
          emergencyCaseTrends: cleanText(response.data.insights.emergencyCaseTrends),
          bedOccupancyRate: cleanText(response.data.insights.bedOccupancyRate),
          doctorPatientRatio: cleanText(response.data.insights.doctorPatientRatio),
          appointmentTrends: cleanText(response.data.insights.appointmentTrends),
          financialImpact: cleanText(response.data.insights.financialImpact),

        };
        setInsights(cleanedData);
      } catch (error) {
        // console.error("Error fetching insights:", error);
      }
    };

    fetchInsights();
  }, []); //  Removed `insights` from dependency array

  const cleanText = (text) => {
    // Removes the leading bullet point if it exists
    return text.replace(/^(\* )/, '');
  };

  const allInsights = [
    { icon: <Activity />, title: "Patient Readmission Risk", description: insights.patientReadmissionRisk },
    { icon: <Pill />, title: "Medication Optimization", description: insights.medicationOptimization },
    { icon: <Calendar />, title: "Staff Scheduling", description: insights.staffScheduling },
    { icon: <AlertTriangle />, title: "Emergency Case Trends", description: insights.emergencyCaseTrends },
    { icon: <Bed />, title: "Bed Occupancy Rate", description: insights.bedOccupancyRate },
    { icon: <UserCheck />, title: "Doctor-Patient Ratio", description: insights.doctorPatientRatio },
    { icon: <Clock />, title: "Appointment Trends", description: insights.appointmentTrends },
    { icon: <DollarSign />, title: "Financial Impact", description: insights.financialImpact },
  ];

  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);

const showFinancialOverview = role === "admin" || role === "superadmin";
const showAppointments = role === "admin" || role === "superadmin" || role === "Receptionist"

const firstGridCols = showFinancialOverview ? "lg:grid-cols-2" : "lg:grid-cols-1";
const secondGridCols = [showAppointments, true, true].filter(Boolean).length; // total visible items
const secondGridClass = `lg:grid-cols-${secondGridCols}`;


  useEffect(() => {
    if (!expanded && !paused) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % allInsights.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [expanded, paused]);

  const toggleExpand = () => {
    setExpanded(!expanded);
    setPaused(expanded ? false : true); // Resume rotation when collapsed
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen"
    style={{
      backgroundColor: mode === "dark" && "#020817",
      color: mode === "dark" && "white",
      }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {/* <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-100" onClick={() => setShowReports(!showReports)}>
            <BarChart4 className="h-4 w-4" />
            Reports
          </button> */}
          {/* <button className={`flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-md text-sm ${mode === "dark" ? "bg-teal-900 hover:bg-teal-800 text-black" : "text-white"}`}>
            <Calendar className="h-4 w-4" />
            Schedule
          </button> */}
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { icon: <Users />, label: "Total Patients", value: patientsData?.data.length, change: "12%", color: mode === "dark" ? "bg-blue-800" : "bg-blue-300",bgColor: mode === "dark" ? "#020817" : "bg-blue-100"},
          { icon: <Calendar />, label: "Appointments", value: appointmentData?.data.length, change: "8%", color: mode === "dark" ? "bg-teal-800" :"bg-teal-300", bgColor: mode === "dark" ? "#020817" : "bg-teal-100" },
          { icon: <Bed />, label: "Bed Occupancy", value: roomsData?.data.length, change: "-3%", color: mode === "dark" ? "bg-amber-800" : "bg-amber-300", bgColor: mode === "dark" ? "#020817" : "bg-amber-100" },
          { icon: <Activity />, label: "Operations", value: operationsData?.data.length, change: "5%", color: mode === "dark" ? "bg-purple-800" : "bg-purple-300", bgColor: mode === "dark" ? "#020817" : "bg-purple-100" },
        ].map((item, index) => (
          <div key={index} className={`${item.bgColor} rounded-lg border border-gray-200 p-6 flex items-center gap-4`}>
            <div className={`p-3 rounded-full ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">{item.value}</p>
                {/* <span className={`flex items-center text-xs ml-2 ${item.change.includes('-') ? "text-red-500" : "text-green-500"}`}>
                  {item.change.includes('-') ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  {item.change}
                </span> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
       <div className="bg-white border border-teal-300 rounded-lg p-6 mb-6 shadow-lg transition-all duration-300"
       style={{
        backgroundColor: mode === "dark" && "#020817",
        color: mode === "dark" && "white",
        }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">AI Health Insights</h2>
          <p className="text-gray-500">Personalized recommendations based on hospital data</p>
        </div>
        <button
          onClick={toggleExpand}
          className="flex items-center text-teal-600 font-semibold border border-teal-300 px-3 py-1 rounded-md hover:bg-teal-100 transition-all"
        >
          {expanded ? "Collapse" : "Expand"} {expanded ? <ChevronUp className="ml-1" /> : <ChevronDown className="ml-1" />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 transition-transform duration-500 ease-in-out transform">
        {(expanded ? allInsights : allInsights.slice(index, index + 3)).map((item, i) => {
          const bgColors = ["bg-[#E6F7E6]", "bg-[#E6F2FF]", "bg-[#FFE6F2]", "bg-[#FFF5E6]", "bg-[#E6F5FF]", "bg-[#F2E6FF]", "bg-[#E6FFF2]", "bg-[#FFF0F5]"];
          const darkBgColors = [
            "bg-[#1A331A]", // darker forest green
            "bg-[#0D1A33]", // deeper navy blue
            "bg-[#330D1A]", // rich dark rose
            "bg-[#33260D]", // deep golden brown
            "bg-[#0D2A33]", // darker cyan/teal
            "bg-[#1A0D33]", // deep violet
            "bg-[#0D3326]", // dark emerald/mint
            "bg-[#330D26]", // deep mauve/pink
          ];
          

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-md shadow-md transition-opacity duration-700 ease-in-out  ${mode === "dark" ? darkBgColors[i % darkBgColors.length] : bgColors[i % bgColors.length]} ${
                !expanded ? "animate-fade-in-out" : ""
              }`}
            >
              <div className="p-3 rounded-full bg-white text-black">{item.icon}</div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Widgets */}
      <div className={`grid grid-cols-1 gap-6 mb-6`}>
      {/* {showFinancialOverview && <FinancialOverview />} */}
      <PatientPortal />
      </div>

<div className={`grid grid-cols-1 ${secondGridClass} gap-6 mb-6`}>
  {(role === "admin" || role === "superadmin" || permissionsData?.permissionsspecial.includes("viewDashboardAppointments")) && <Appointments />}
  <DepartmentStatus />
  <InventoryAlerts />
</div>

</div>
  );
};

export default Dashboard;
