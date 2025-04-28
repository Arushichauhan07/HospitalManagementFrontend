import React from "react";
import { useSelector } from "react-redux";
import { useOutsideClick } from "../../components/hooks/useOutsideClick";

const OperationDetails = ({ isModalOpen, closeModal, operation }) => {
  const { mode } = useSelector((state) => state.theme);
  const ref = useOutsideClick(() => {
    closeModal();
  });
  
  if (!isModalOpen) return null;
  

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
    <div ref={ref} className={`rounded-lg p-6 max-w-md w-full ${mode === "dark" ? "bg-black" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Operation Details</h2>
        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
  
      <div className="border-b pb-4 mb-4">
        <h3 className="font-bold text-lg mb-2">{operation.patient_details.name}</h3>
        <p className="text-gray-500 text-sm mb-2">ID: {operation.patient_details.id}</p>
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          {operation.status}
        </span>
      </div>
  
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Patient Gender:</p>
          <p className="font-medium">{operation.patient_details.gender}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Operation Type:</p>
          <p className="font-medium">{operation.operationType}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Surgeon:</p>
          <p className="font-medium">{operation.doctor_details[0].name}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Specialization:</p>
          <p className="font-medium">{operation.doctor_details[0].specialization}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Room:</p>
          <p className="font-medium">{operation.operationRoom}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Date:</p>
          <p className="font-medium">
            {new Date(operation.operationDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Duration:</p>
          <p className="font-medium">{operation.duration} Minutes</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-gray-600">Anesthesia:</p>
          <p className="font-medium">{operation.anesthesiaType}</p>
        </div>
      </div>
  
      <div className="mb-6">
        <h4 className="font-bold mb-2">Notes</h4>
        <p className={`${mode === "dark" ? "bg-gray-800" : "bg-gray-50"} p-3 rounded`}>{operation.notes}</p>
      </div>
  
      <div className="flex justify-end">
        <button onClick={closeModal} className="bg-teal-500 text-white px-4 py-2 rounded-md">
          Close
        </button>
      </div>
    </div>
    </div>
  
  )
}

export default OperationDetails
