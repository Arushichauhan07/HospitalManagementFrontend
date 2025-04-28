import ProgressBar from "./ProgressBar";
import { Stethoscope, Bed, Activity, Pill, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetRoomsQuery } from "../../redux/slices/roomSlice";

const DepartmentStatus = () => {
  const { data: roomData } = useGetRoomsQuery();
  const departments = [
    { icon: <Stethoscope />, name: "Emergency", value: 85, iconColor: "text-blue-500" },
    { icon: <Bed />, name: "ICU", value: 92, iconColor: "text-yellow-500" },
    { icon: <Activity />, name: "Surgery", value: 65, iconColor: "text-red-500" },
    { icon: <Pill />, name: "Pharmacy", value: 45, iconColor: "text-green-500" },
    { icon: <TrendingUp />, name: "Radiology", value: 70, iconColor: "text-purple-500" },
  ];
  const { mode } = useSelector((state) => state.theme);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
    style={{
      backgroundColor: mode === "dark" && "#020817",
      color: mode === "dark" && "white",
      }}>
      <h2 className="text-2xl font-bold">Room Status</h2>
      <p className="text-sm text-gray-500 mb-4 font-medium">Current room capacity</p>

      <div className="space-y-4">
        {roomData?.data.map((room, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {/* Apply the background color to the icon wrapper */}
                <div className={`w-4 h-4 flex items-center justify-center ${room.iconColor}`}>
                  {room.icon}
                </div>
                <span>{room.roomType}</span>
              </div>
              <span className="text-sm font-medium">{room.occupiedBedsCount}%</span>
            </div>
            <ProgressBar value={room.occupiedBedsCount} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentStatus;
