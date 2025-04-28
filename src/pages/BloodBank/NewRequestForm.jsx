import React, { useState } from 'react';
import { useCreateBloodRequestMutation } from "../../redux/slices/bloodBankSlice";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { useOutsideClick } from '../../components/hooks/useOutsideClick';

const NewRequestForm = ({ onClose }) => {
  const [createBloodRequest] = useCreateBloodRequestMutation();
  const [requestData, setRequestData] = useState({
    patientName: "",
    bloodType: "",
    unitsRequested: 0,
    requestDate: "",
    status: "",
    urgency: "",
    contact: ""
  });

  const ref = useOutsideClick(() => {
    onClose();
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createBloodRequest(requestData).unwrap();
      toast.success('Blood request uploaded successfully!');
      
      // Reset form after submission
      setRequestData({
        patientName: "",
        bloodType: "",
        unitsRequested: 0,
        requestDate: "",
        status: "",
        urgency: "",
        contact: ""
      });
      
      onClose(); // Close the form after submission
    } catch (error) {
      // console.error('Error submitting blood request:', error);
      alert('Failed to submit blood request. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6rounded-lg shadow-md" ref={ref}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Blood Request</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={requestData.patientName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type
            </label>
            <select
              name="bloodType"
              value={requestData.bloodType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Date
            </label>
            <input
              type="date"
              name="requestDate"
              value={requestData.requestDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <input
              type="text"
              name="contact"
              value={requestData.contact}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter contact information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units Requested
            </label>
            <input
              type="number"
              name="unitsRequested"
              min="1"
              max="10"
              value={requestData.unitsRequested}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency
              </label>
              <select
                name="urgency"
                value={requestData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={requestData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="pending">Pending</option>
              <option value="fulfilled">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRequestForm;
