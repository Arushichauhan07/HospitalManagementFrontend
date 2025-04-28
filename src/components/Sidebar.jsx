import { useEffect, useState} from 'react'
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Activity,
  Bed,
  Calendar,
  CreditCard,
  Droplet,
  LogOut,
  Package,
  Pill,
  Shield,
  Stethoscope,
  FileKey2,
  UserRound,
  Users,
  UtensilsCrossed,
  Lock,
} from "lucide-react";
import { socket } from "../components/hooks/useInitSocket";
import { useGetRolePermissionsQuery } from "../redux/slices/roleSlice";
import { useFetchLoggedInUserQuery } from "../redux/slices/authSlice";

const Sidebar = () => {
  const { role } = useSelector((state) => state.role);
  const { mode, sidebar } = useSelector((state) => state.theme);
  const { data : loggedInUserData } = useFetchLoggedInUserQuery();
  const { data : permissionsData, isLoading, error } = useGetRolePermissionsQuery();
  
  const isDark = mode === "dark";

  const sidebarBgClass = isDark ? "bg-[#020817] border border-gray-100" : "bg-white border border-gray-300";
  const textClass = isDark ? "text-white" : "text-black";
  const activeLinkClass = isDark ? "hover:bg-teal-800" : "hover:bg-teal-100";
  const logoutButtonClass = isDark ? "hover:bg-red-700 hover:text-white" : "hover:bg-red-500 hover:text-white";

  const isGradient = typeof sidebar.color === "string" && sidebar.color.startsWith("bg-gradient");
  const gradientClasses = !isDark && isGradient ? `${sidebar.color} text-white` : "";
  const bgStyle = !isDark && !isGradient ? { backgroundColor: sidebar.color || "#0fb3af" } : {};

  // const navItems = [
  //   { to: "dashboard", icon: Activity, label: "Dashboard", roles: ["admin", "superadmin", "Doctor", "Nurse", "Receptionist", "Laboratory"] },
  //   { to: "operations", icon: Shield, label: "Operations", roles: ["admin", "superadmin", "Doctor"] },
  //   { to: "blood-bank", icon: Droplet, label: "BloodBank", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "insurance", icon: Shield, label: "Insurance", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "inventory", icon: Package, label: "Inventory", roles: ["admin", "superadmin", "Nurse", "Receptionist"] },
  //   // { to: "billing", icon: CreditCard, label: "Billing", roles: ["admin"] },
  //   { to: "doctors", icon: Stethoscope, label: "Doctors", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "patients", icon: UserRound, label: "Patients", roles: ["admin", "superadmin", "Nurse", "Receptionist", "Laboratory"] },
  //   { to: "staff", icon: Users, label: "Staff", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "rooms", icon: Bed, label: "Rooms", roles: ["admin", "superadmin", "Receptionist", "Doctor"] },
  //   { to: "laboratory", icon: Pill, label: "Laboratory", roles: ["admin", "superadmin", "Laboratory"] },
  //   // { to: "pharmacy", icon: UserRound, label: "Pharmacy", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "meal-plans", icon: UtensilsCrossed, label: "MealPlans", roles: ["admin", "superadmin", "Nurse", "Receptionist", "Doctor"] },
  //   { to: "appointments", icon: Calendar, label: "Appointments", roles: ["admin", "superadmin","Receptionist", "Doctor"] },
  //   { to: "reports", icon: Activity, label: "Reports", roles: ["admin", "superadmin", "Receptionist"] },
  //   { to: "permissions", icon: Lock, label: "Permissions", roles: ["admin", "superadmin"] },
  //   { to: "roles", icon: FileKey2, label: "Roles", roles: ["admin", "superadmin"] },
  // ];
  

  const SidebarLink = ({ to, label, Icon, isDark, activeLinkClass, textClass }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center p-3 rounded-lg transition duration-300 my-2 ${
            isActive ? "bg-[#0fb3af] text-white" : activeLinkClass
          }`
        }
      >
        <Icon className={`h-5 w-5 ${isDark ? "text-white" : "text-black"}`} />
        <span className={`ml-4 hidden lg:inline ${textClass}`}>{label}</span>
      </NavLink>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-20 lg:w-64 transition-all duration-300 z-50 flex flex-col ${sidebarBgClass} ${gradientClasses}`}
      style={bgStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-center lg:justify-start p-4 h-16">
        <Activity className="h-6 w-6 text-[#0fb3af]" />
        <span className={`hidden lg:inline ml-3 font-bold text-lg ${mode === "dark" ? "text-white" : "text-black"}`}>HealthToHeart</span>
      </div>

      <hr className="border-t border-gray-300 w-full p-0 mt-1" />

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto px-2 mt-3`}>
      <SidebarLink
        to="dashboard"
        label="Dashboard"
        Icon={Activity}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />
      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeOperations")) &&
      <SidebarLink
        to="operations"
        label="Operations"
        Icon={Shield}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeBloodBank")) &&
      <SidebarLink
        to="blood-bank"
        label="BloodBank"
        Icon={Droplet}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeOperations")) &&
      <SidebarLink
        to="insurance"
        label="Insurance"
        Icon={Shield}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeInsurance")) &&
      <SidebarLink
        to="inventory"
        label="Inventory"
        Icon={Package}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeDoctors")) &&
      <SidebarLink
        to="doctors"
        label="Doctors"
        Icon={Stethoscope}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeePatients")) &&
      <SidebarLink
        to="patients"
        label="Patients"
        Icon={UserRound}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeStaff")) &&
      <SidebarLink
        to="staff"
        label="Staff"
        Icon={Users}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}

      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeRooms")) &&
      <SidebarLink
        to="rooms"
        label="Rooms"
        Icon={Bed}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeLaboratory")) &&
      <SidebarLink
        to="laboratory"
        label="Laboratory"
        Icon={Pill}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeMealPans")) &&
      <SidebarLink
        to="meal-plans"
        label="MealPlans"
        Icon={UtensilsCrossed}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeAppointments")) &&
      <SidebarLink
        to="appointments"
        label="Appointments"
        Icon={Calendar}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin" || permissionsData?.permissionsspecial.includes("SeeReports")) &&
      <SidebarLink
        to="reports"
        label="Reports"
        Icon={Activity}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin") &&
      <SidebarLink
        to="permissions"
        label="Permissions"
        Icon={Lock}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      {(role === "superadmin" || role === "admin") &&
      <SidebarLink
        to="roles"
        label="Roles"
        Icon={FileKey2}
        isDark={isDark}
        activeLinkClass={activeLinkClass}
        textClass={textClass}
      />}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300">
        <button
          className={`flex items-center w-full p-3 rounded-md ${logoutButtonClass}`}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("light");
            socket.disconnect();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-5 w-5" />
          <span className={`ml-4 hidden lg:inline ${mode === "dark" ? "text-white" : "text-black"}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
