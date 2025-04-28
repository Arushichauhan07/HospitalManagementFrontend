import React, { useState } from "react";
import { useCreateOperationMutation } from "../../redux/slices/operationSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useOutsideClick } from "../../components/hooks/useOutsideClick";
import {socket} from "../../components/hooks/useInitSocket";
import { useCreateNotificationsMutation, useGetAllNotificationsQuery } from "../../redux/slices/notificationSlice";
import { useFetchLoggedInUserQuery } from "../../redux/slices/authSlice"
import { useGetDoctorsQuery } from "../../redux/slices/doctorSlice"

const OperationUploadForm = ({ onClose }) => {
  const [createOperation, { isLoading, isError, isSuccess }] = useCreateOperationMutation();
  const { mode } = useSelector((state) => state.theme);
  const [createNotification] = useCreateNotificationsMutation();
  const { data: logInUser } = useFetchLoggedInUserQuery();
  const { data : doctors } = useGetDoctorsQuery();
  const [operationDetails, setOperationDetails] = useState({
    doctor_name: "",  
    patient_name: "",
    operationType: "",
    operationDate: "", 
    operationRoom: "",
    anesthesiaType: "",
    duration: "",   
    status: "Scheduled",
    notes: ""
  });

  // console.log("logInUser", logInUser)
  // console.log("doctors", doctors)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOperationDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createOperation(operationDetails).unwrap();
      // console.log("Operation created:", response);
      toast.success("Operation scheduled successfully!"); // Show success toast
      if(response.success === true){
        socket.emit("operation-scheduled", {
          to: response.data.doctor_details[0],
          message: "Operation assigned to you",
          date: new Date(),
          notDesc: response.data.operationDate
        })

        await createNotification({
          sender: logInUser._id, // doctor ID
          receiver: response.data.doctor_details[0],
          message: "An operation has been scheduled for you.",
          notDesc: response.data.operationDate,
        });
      }
      
      // Reset the form
      setOperationDetails({
        doctor_name: "",
        patient_name: "",
        operationType: "",
        operationDate: "",
        operationRoom: "",
        anesthesiaType: "",
        duration: "",
        status: "Scheduled",
        notes: ""
      });

      onClose(); // Close modal or form
    } catch (error) {
      // console.error("Error creating operation:", error);
      toast.error("Failed to schedule operation."); // Show error toast
    }
  };

  const ref = useOutsideClick(() => {
    onClose()
    });

  return (
    <div className="p-6" ref={ref}>
      <h2 className="text-xl font-bold mb-4">Schedule New Operation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Operation Details</h3>

            <div className="mb-4">
              <label className="block font-medium">Operation Type:</label>
              <select
                name="operationType"
                value={operationDetails.operationType}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select type</option>
                <option value="Lungs">Lungs</option>
                <option value="Heart">Heart</option>
                <option value="Brain">Brain</option>
                <option value="Kidney">Kidney</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="doctor_name" className="text-gray-700 font-medium">Doctor</label>
                    <select
                        name="doctor_name"
                        value={operationDetails?.doctor_name}
                        required
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-300"
                    >
                        <option value="">Select doctor</option>
                        {doctors?.data
                            ?.filter((doc) => doc?.status === "active" && doc?.role_id?.role_name === 'Doctor')
                            ?.map((doctor) => (
                                <option key={doctor?._id} value={doctor?.name}>
                                    {doctor.id}{" - "}{doctor.name}
                                </option>
                            ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium">Patient Name:</label>
              <input
                type="text"
                name="patient_name"
                value={operationDetails.patient_name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Operation Room:</label>
              <select
                name="operationRoom"
                value={operationDetails.operationRoom}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select room</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Schedule</h3>
            <div className="mb-4">
              <label className="block font-medium">Operation Date:</label>
              <input
                type="date"
                name="operationDate"
                value={operationDetails.operationDate}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Duration (minutes):</label>
              <input
                type="number"
                name="duration"
                value={operationDetails.duration}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Anesthesia Type:</label>
              <select
                name="anesthesiaType"
                value={operationDetails.anesthesiaType}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Anesthesia</option>
                <option value="Local">Local</option>
                <option value="General">General</option>
                <option value="Regional">Regional</option>
                <option value="None">None</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium">Notes:</label>
              <textarea
                name="notes"
                value={operationDetails.notes}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-white rounded-md ${
              mode === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-teal-500 hover:bg-teal-600"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600`}
            disabled={isLoading}
          >
            {isLoading ? "Scheduling..." : "Schedule Operation"}
          </button>
        </div>

        {isError && <p className="text-red-500 mt-2">Failed to schedule operation.</p>}
        {isSuccess && <p className="text-green-500 mt-2">Operation scheduled successfully!</p>}
      </form>
    </div>
  );
};

export default OperationUploadForm;
