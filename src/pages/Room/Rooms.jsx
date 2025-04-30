import React, { useState, useEffect } from 'react';
import { Search, Calendar, Plus, Filter, Download, MoreVertical, MoreHorizontal, X, Edit, Trash2 } from 'lucide-react';
import { useGetRoomsQuery, useDeleteRoomMutation, useGetAssignRoomsQuery, useDeleteAssignRoomMutation } from '../../redux/slices/roomSlice';
import AddRoomForm from './AddRoomForm';
import AssignRoomForm from './AssignRoomForm';
import Button from "../../components/UI/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/UI/Tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/UI/DropMenu"
import { toast } from 'react-toastify';
import useFormattedDate from '../../components/hooks/useFormattedDate';
import { downloadPdf } from '../../components/utilis/DownloadPdfs';
import { useSelector } from 'react-redux';


const RoomsManagement = () => {
  const [tabValue, setTabValue] = useState("rooms");
  const [activeTab, setActiveTab] = useState('directory');
  const { data, isLoading } = useGetRoomsQuery();
  const { data: assignRooms, isLoading:assignRoomDataLoading } = useGetAssignRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [deleteAssignRoom] = useDeleteAssignRoomMutation();
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [showAssignRoomForm, setShowAssignRoomForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRoom, setEditingRoom] = useState(null);
  const formatDate = useFormattedDate();
  const { mode } = useSelector((state) => state.theme);
  
  const isDark = mode === "dark";

  const handleDelete = async (room) => {
      try {
        await deleteRoom(room._id).unwrap();
        toast.success(`Room ${room.room_name} deleted successfully`);
      } catch (error) {
        // console.error('Delete error:', error);
        toast.error('Failed to delete room');
      } finally {
        setIsOpen(false);
      }
    };

  const handleAssignRoomDelete = async (assignRoom) => {
      try {
        await deleteAssignRoom(assignRoom._id).unwrap();
        toast.success(`Assign Room deleted successfully`);
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete room');
      }
    };

    const editRoom = (room) => {
      // setEditingRoom(room);
      // setShowAddRoomForm(true);
    };


    
  // Pagination for Rooms.
  const [roomCurrentPage, setRoomMealCurrentPage] = useState(1);
  const roomitemsPerPage = 5;
  const roomData = data?.data || []
  const roomtotalPages = Math.ceil(roomData.length / roomitemsPerPage);

  const paginatedRooms = roomData.slice(
    (roomCurrentPage - 1) * roomitemsPerPage,
    roomCurrentPage * roomitemsPerPage
  );

  const roomHandlePrev = () => setRoomMealCurrentPage(prev => Math.max(prev - 1, 1));
  const roomHandleNext = () => setRoomMealCurrentPage(prev => Math.min(prev + 1, roomtotalPages));

    const filteredRooms = paginatedRooms.filter((room) =>
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_name.toLowerCase().includes(searchTerm.toLowerCase())

    );

    // Pagination for Assigned Rooms.
    const [assignRoomCurrentPage, setAssignRoomCurrentPage] = useState(1);
    const assignroomItemPerPage = 5;
    const assignRoomData = assignRooms || []
    const assignRoomTotalPages = Math.ceil(assignRoomData.length / assignroomItemPerPage);

    const paginatedAssignRoom = assignRoomData.slice(
      (assignRoomCurrentPage - 1) * assignroomItemPerPage,
      assignRoomCurrentPage * assignroomItemPerPage
    );

    const assignRoomHandlePrev = () => setAssignRoomCurrentPage(prev => Math.max(prev - 1, 1));
    const assignRoomHandleNext = () => setAssignRoomCurrentPage(prev => Math.min(prev + 1, assignRoomTotalPages));

    const filteredAssignRooms = paginatedAssignRoom?.filter((room) =>
      room.roomId?.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomId?.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.patientId?.id.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (isLoading || assignRoomDataLoading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
              </div>
          </div>
      );
  }
  return (
    <div className={`p-4 ${isDark ? "bg-black" : "bg-gray-50"} min-h-screen`}>
      
      {showAddRoomForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50">
            <AddRoomForm 
            setShowAddRoomForm={setShowAddRoomForm} 
            />
        </div>
      )}
      
      {showAssignRoomForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50">
            <AssignRoomForm 
            setShowAssignRoomForm={setShowAssignRoomForm}
            />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-gray-500" : "text-gray-900"}`}>Rooms Management</h1>
        <div className="flex gap-2 md:flex-row flex-col">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-md  ${isDark ? "bg-teal-900 text-black" : "bg-teal-500 text-white"}`}
          onClick={() => setShowAssignRoomForm(true)}
          >
            <Calendar size={18} />
            <span>Add Reservation</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md  ${isDark ? "bg-teal-900 text-black" : "bg-teal-500 text-white"}`}
            onClick={() => setShowAddRoomForm(true)}
          >
            <Plus size={18} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search rooms by number, type, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full border-2 border-gray-400 h-10 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
          />
        </div>
        {/* <button className="p-2 border border-gray-300 bg-white rounded-md">
          <Filter size={20} className="text-gray-600" />
        </button> */}
        <button 
        className={`flex items-center gap-2 px-4 py-2 border border-gray-300  rounded-md  ${isDark ? "bg-black text-gray-100" : "bg-white text-gray-700" }`}
        onClick={() => {
          if (tabValue === "rooms") {
          const headers = ["Room Id", "Room Number", "Room Type", "Department", "Total Beds", "Beds Occupied"];
          const exportData = data?.data?.map((room) => [
            room.room_id,
            room.room_number,
            room.roomType,
            room.room_name,
            room.bedsCount,
            room.occupiedBedsCount,
          ]);

          downloadPdf({
            title: "Rooms Data",
            headers,
            data: exportData,
            fileName: "room_data.pdf",
          });
        } else if (tabValue === "assignments") {
        const headers = ["Patient Id", "Room Number", "Room Type", "Bed Number", "Discharge Date", "Notes", "Status"];
        const exportData = assignRooms?.map((assignment) => [
        assignment?.patientId?.id,
        assignment?.roomId?.room_number,
        assignment?.roomId?.roomType,
        assignment.bedNumber,
        formatDate(assignment.expectedDischarge),
        assignment.notes,
        assignment.status,
      ]);

      downloadPdf({
        title: "Room Assignments",
        headers,
        data: exportData,
        fileName: "room_assignments.pdf",
      });
    }
        }}
      >
        <Download size={18} />
        <span>Export</span>
      </button>

      </div>

      {/* Tabs */}
      <Tabs defaultValue="rooms" value={tabValue} onValueChange={setTabValue} className="mb-6">
      <div className="flex gap-1 mb-6">
      <TabsList className="bg-teal-100">
      <TabsTrigger
        value="rooms"
        className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
      >
        Rooms Directory
      </TabsTrigger>
      <TabsTrigger
        value="assignments"
        className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
      >
        Room Assignments
      </TabsTrigger>
    </TabsList>
  </div>

  {/* Rooms Directory Content */}
  <TabsContent value="rooms" className="mt-4">
    <div className="rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? "text-gray-400" : "text-gray-800" }`}>Rooms Directory</h2>
        <p className="text-gray-500 text-sm">Complete list of hospital rooms</p>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full table-auto">
       <thead>
        <tr className=" text-left">
          <th className="px-4 py-3">Room ID</th>
          <th className="px-4 py-3">Room Number</th>
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Department</th>
          <th className="px-4 py-3">Total Beds</th>
          <th className="px-4 py-3">Beds Occupied</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
        </thead>
        <tbody>
        {filteredRooms?.length === 0 ? (
          <tr>
          <td colSpan={8} className="text-center py-4">
          No rooms found.
        </td>
        </tr>
        ) : (
        filteredRooms?.map((room) => (
        <tr key={room.room_id} className="border-b">
          <td className="px-4 py-3">{room.room_id}</td>
          <td className="px-4 py-3">{room.room_number}</td>
          <td className="px-4 py-3">{room.roomType}</td>
          <td className="px-4 py-3">{room.room_name}</td>
          <td className="px-4 py-3">{room.bedsCount}</td>
          <td className="px-4 py-3">{room.occupiedBedsCount}</td>
          <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium
              ${
                room.roomStatus === 'Available'
                  ? isDark
                    ? 'bg-green-900 text-green-300'
                    : 'bg-green-100 text-green-600'
                  : isDark
                    ? 'bg-red-900 text-red-300'
                    : 'bg-red-100 text-red-600'
              }
            `}
          >
            {room.roomStatus}
          </span>

          </td>
          <td className="px-4 py-3 text-right">
          <Trash2 className="h-5 w-5 ml-4" onClick={() => handleDelete(room)}/>
            {/* Room Actions */}
            {/* <DropdownMenu className="bg-white">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editRoom(room)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(room)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </td>
        </tr>
          ))
        )}
      </tbody>
      </table>

      </div>
    </div>
     {roomData.length >= 5 && (
                              <div className="border-t border-gray-200 py-4 flex items-center justify-between px-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-teal-500 hover:text-teal-600"
                                  onClick={roomHandlePrev}
                                  disabled={roomCurrentPage === 1}
                                >
                                  Previous
                                </Button>
                                <p className="text-sm text-gray-500">
                                  Page {roomCurrentPage} of {roomtotalPages}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-teal-500 hover:text-teal-600"
                                  onClick={roomHandleNext}
                                  disabled={roomCurrentPage === roomtotalPages}
                                >
                                  Next
                                </Button>
                              </div>
              )}
  </TabsContent>

  {/* Room Assignments Content */}
  <TabsContent value="assignments" className="mt-4">
    <div className="rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? "text-gray-400" : "text-gray-800" }`}>Room Assignments</h2>
        <p className="text-gray-500 text-sm">Assign rooms to patients</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className=" text-left">
              <th className="px-4 py-3">Patient ID</th>
              <th className="px-4 py-3">Room Number</th>
              <th className="px-4 py-3">Room Type</th>
              <th className="px-4 py-3">Bed Number</th>
              <th className="px-4 py-3">Admission Date</th>
              <th className="px-4 py-3">Discharge Date</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignRooms?.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-4">
                No Assign rooms found.
              </td>
            </tr>
            ) : (
          filteredAssignRooms?.map((assignRoom) => (
          <tr key={assignRoom._id} className="border-b">
          <td className="px-4 py-3">{assignRoom?.patientId?.id}</td>
          <td className="px-4 py-3">{assignRoom?.roomId?.room_number}</td>
          <td className="px-4 py-3">{assignRoom?.roomId?.roomType}</td>
          <td className="px-4 py-3">{assignRoom?.bedNumber}</td>
          <td className="px-4 py-3">{formatDate(assignRoom?.admissionDate)}</td>
          <td className="px-4 py-3">{formatDate(assignRoom?.expectedDischarge)}</td>
          <td className="px-4 py-3">{assignRoom?.notes}</td>
          <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium
              ${
                assignRoom?.roomStatus === 'Available'
                  ? isDark
                    ? 'bg-green-900 text-green-300'
                    : 'bg-green-100 text-green-600'
                  : isDark
                    ? 'bg-red-900 text-red-300'
                    : 'bg-red-100 text-red-600'
              }
            `}
          >
            {assignRoom?.status}
          </span>

        </td>
        <td className="px-4 py-3 text-right">
        <Trash2 className="h-5 w-5 ml-3" onClick={() => handleAssignRoomDelete(assignRoom)}/>
          {/* <DropdownMenu className="bg-white">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editRoom(assignRoom)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAssignRoomDelete(assignRoom)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </td>
      </tr>
    ))
            )}
        </tbody>

        </table>
      </div>
    </div>
    {assignRoomData.length >= 5 && (
    <div className="border-t border-gray-200 py-4 flex items-center justify-between px-6">
      <Button
        variant="ghost"
        size="sm"
        className="text-teal-500 hover:text-teal-600"
        onClick={assignRoomHandlePrev}
        disabled={assignRoomCurrentPage === 1}
      >
        Previous
      </Button>
      <p className="text-sm text-gray-500">
        Page {assignRoomCurrentPage} of {assignRoomTotalPages}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="text-teal-500 hover:text-teal-600"
        onClick={assignRoomHandleNext}
        disabled={assignRoomCurrentPage === assignRoomTotalPages}
      >
        Next
      </Button>
    </div>)}
  </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoomsManagement;
