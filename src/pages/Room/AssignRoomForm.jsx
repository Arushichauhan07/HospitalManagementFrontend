import React, { useState } from 'react';
import { useAssignRoomsMutation } from '../../redux/slices/roomSlice';
import { useGetPatientsQuery } from '../../redux/slices/patientSlice';
import { useGetRoomsQuery } from '../../redux/slices/roomSlice'; 
import { toast } from 'react-toastify';
import { useOutsideClick } from '../../components/hooks/useOutsideClick';

const AssignRoomForm = ({ setShowAssignRoomForm }) => {
  const [assignRooms, { isLoading }] = useAssignRoomsMutation();
  const { data: patients } = useGetPatientsQuery();
  const { data: rooms } = useGetRoomsQuery();

  console.log("patients",patients)
  // console.log("rooms",rooms)

  const [formData, setFormData] = useState({
    patientId: '',
    roomId: '',
    bedNumber: '',
    admissionDate: '',
    expectedDischarge: '',
    notes: '',
  });

  const ref = useOutsideClick(() => {
    setShowAssignRoomForm(false);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignRooms(formData).unwrap();
      toast.success('Room assigned successfully!');
      setShowAssignRoomForm(false);
      setFormData({
        patientId: '',
        roomId: '',
        bedNumber: '',
        admissionDate: '',
        expectedDischarge: '',
        notes: '',
      });
    } catch (error) {
      // console.error('Error assigning room:', error);
      toast.error(error?.data?.message || 'Failed to assign room');
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl p-8 mx-auto bg-white text-black rounded-2xl shadow-xl space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-teal-600">Assign Room</h2>
        <p className="text-sm text-gray-500">
          Assign a patient to a room and bed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
            required
          >
          <option value="">Select Patient</option>
          {patients?.data?.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.name}
            </option>
          ))}
        </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Room
          </label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
            required
          >
            <option value="">Select Room</option>
            {rooms?.data?.map((room) => (
              <option key={room._id} value={room._id}>
                {room.room_name} ({room.room_number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bed Number
          </label>
          <input
            type="number"
            name="bedNumber"
            value={formData.bedNumber}
            onChange={handleChange}
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Admission Date
          </label>
          <input
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expected Discharge
          </label>
          <input
            type="date"
            name="expectedDischarge"
            value={formData.expectedDischarge}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? 'Assigning...' : 'Assign Room'}
        </button>
      </div>
    </form>
  );
};

export default AssignRoomForm;
