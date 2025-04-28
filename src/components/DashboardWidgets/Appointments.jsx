import { BadgeCheck, Clock, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetAppointmentsQuery } from "../../redux/slices/appointmentsSlice";
import  useFormattedDate from "../hooks/useFormattedDate";

const Appointments = () => {
  const { data : appointmentData} = useGetAppointmentsQuery();
  const { mode } = useSelector((state) => state.theme);
  const formatDate = useFormattedDate()

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
    style={{
      backgroundColor: mode === "dark" && "#020817",
      color: mode === "dark" && "white",
      }}>
      <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
      <p className="text-sm text-gray-500 mb-4 font-medium">Today's scheduled visits</p>

      <div className="space-y-4">
        {appointmentData?.data?.map((app, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-medium">
              {app?.patientId.name?.charAt(0).toUpperCase()}
              </div>
              {/* <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${app.status} border-2 border-white`}></div> */}
            </div>

            <div className="flex-1">
              <p className="font-medium">{app?.patientId.name}</p>
              <p className="text-sm text-gray-500">{app.reason}</p>
            </div>

            <div className="bg-teal-50 text-teal-900 px-3 py-3 rounded-full text-xs font-medium">
              {formatDate(app.slotTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
