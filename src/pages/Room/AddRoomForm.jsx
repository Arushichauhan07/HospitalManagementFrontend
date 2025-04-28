import React, { useState } from 'react';
import { useCreateRoomsMutation } from '../../redux/slices/roomSlice';
import { toast } from 'react-toastify';
import { useOutsideClick } from '../../components/hooks/useOutsideClick';

const AddRoomForm = ({setShowAddRoomForm}) => {
  const [createRoom, { isLoading }] = useCreateRoomsMutation();
  const [formData, setFormData] = useState({
    room_number: '',
    room_name: '',
    bedsCount: '',
    occupiedBedsCount: '',
    roomType: '',
    roomStatus: '',
  });
  
  const ref = useOutsideClick(() => {
    setShowAddRoomForm(false);
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
      await createRoom(formData).unwrap();
      toast.success('Room created successfully!');
      setShowAddRoomForm(false)
      setFormData({
        room_number: '',
        room_name: '',
        bedsCount: '',
        occupiedBedsCount: '',
        roomType: '',
        roomStatus: '',
      });
    } catch (error) {
      // console.error('Error creating room:', error);
      toast.error(error?.data?.message || 'Failed to create room');
    }
  };

  return (
    <form
    ref = {ref}
    onSubmit={handleSubmit}
    className="w-full max-w-2xl p-8 mx-auto bg-white text-black rounded-2xl shadow-xl space-y-6"
    >
  <div className="space-y-1">
    <h2 className="text-2xl font-bold text-teal-600">Add New Room</h2>
    <p className="text-sm text-gray-500">
      Please fill in the details below to add a new room.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label htmlFor="room_number" className="block text-sm font-medium text-gray-700">
        Room Number
      </label>
      <input
        type="text"
        name="room_number"
        id="room_number"
        value={formData.room_number}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
        required
      />
    </div>

    <div>
      <label htmlFor="room_name" className="block text-sm font-medium text-gray-700">
        Room Name
      </label>
      <input
        type="text"
        name="room_name"
        id="room_name"
        value={formData.room_name}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
        required
      />
    </div>

    <div>
      <label htmlFor="bedsCount" className="block text-sm font-medium text-gray-700">
        Beds Count
      </label>
      <input
        type="number"
        name="bedsCount"
        id="bedsCount"
        value={formData.bedsCount}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
      />
    </div>

    <div>
      <label htmlFor="occupiedBedsCount" className="block text-sm font-medium text-gray-700">
        Occupied Beds
      </label>
      <input
        type="number"
        name="occupiedBedsCount"
        id="occupiedBedsCount"
        value={formData.occupiedBedsCount}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
        required
      />
    </div>

    <div>
      <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
        Room Type
      </label>
      <select
        name="roomType"
        id="roomType"
        value={formData.roomType}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
        required
      >
        <option value="">Select Room Type</option>
        <option value="General">General</option>
        <option value="Multi-Sharing Ward">Multi-Sharing Ward</option>
        <option value="Semi-Private Room">Semi-Private Room</option>
        <option value="Private Room">Private Room</option>
        <option value="Deluxe Room">Deluxe Room</option>
        <option value="Suite Room">Suite Room</option>
        <option value="Junior Suite">Junior Suite</option>
        <option value="Super Deluxe Room">Super Deluxe Room</option>
        <option value="ICU">ICU</option>
        <option value="CCU">CCU</option>
        <option value="Isolation Room">Isolation Room</option>
        <option value="Pediatric Room">Pediatric Room</option>
        <option value="Maternity Room">Maternity Room</option>
        <option value="Recovery Room">Recovery Room</option>,
      </select>
    </div>

    <div>
      <label htmlFor="roomStatus" className="block text-sm font-medium text-gray-700">
        Room Status
      </label>
      <select
        name="roomStatus"
        id="roomStatus"
        value={formData.roomStatus}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-400"
        required
      >
        <option value="">Select Room Status</option>
        <option value="Available">Available</option>
        <option value="Occupied">Occupied</option>
      </select>
    </div>
  </div>

  <div className="flex justify-end">
    <button
      type="submit"
      disabled={isLoading}
      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-xl transition-all disabled:opacity-50"
    >
      {isLoading ? 'Saving...' : 'Add Room'}
    </button>
  </div>
    </form>

  );
};

export default AddRoomForm;
