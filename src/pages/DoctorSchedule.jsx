import React, { useState } from "react";

const DoctorForm = ({ onSubmit }) => {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    department: "",
    specialization: "",
    degree: "",
    experience: "",
    description: "",
    password: "",
    confirmPassword: "",
    schedule: [],
  });

  const [newSchedule, setNewSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
    slots: [],
  });

  const departments = ["Cardiology", "Dermatology", "Orthopedics", "Neurology"];

  // Handle input changes
  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  // Handle schedule change
  const handleScheduleChange = (e) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  // Add a new schedule
  const addSchedule = () => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime) {
      setDoctor({ ...doctor, schedule: [...doctor.schedule, newSchedule] });
      setNewSchedule({ day: "", startTime: "", endTime: "", slots: [] });
    } else {
      alert("Please fill in all schedule fields.");
    }
  };

  // Remove schedule
  const removeSchedule = (index) => {
    const updatedSchedule = doctor.schedule.filter((_, i) => i !== index);
    setDoctor({ ...doctor, schedule: updatedSchedule });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (doctor.password !== doctor.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSubmit(doctor);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Doctor Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <input type="text" name="name" placeholder="Name" value={doctor.name} onChange={handleChange} className="input" required />
        <input type="email" name="email" placeholder="Email" value={doctor.email} onChange={handleChange} className="input" required />
        <input type="text" name="phoneNo" placeholder="Phone No." value={doctor.phoneNo} onChange={handleChange} className="input" required />
        <textarea name="address" placeholder="Address" value={doctor.address} onChange={handleChange} className="input" required />

        {/* Professional Details */}
        <select name="department" value={doctor.department} onChange={handleChange} className="input">
          <option value="">Select Department</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>
        <input type="text" name="specialization" placeholder="Specialization" value={doctor.specialization} onChange={handleChange} className="input" />
        <input type="text" name="degree" placeholder="Degree" value={doctor.degree} onChange={handleChange} className="input" />
        <input type="number" name="experience" placeholder="Experience (Years)" value={doctor.experience} onChange={handleChange} className="input" />
        <textarea name="description" placeholder="Description" value={doctor.description} onChange={handleChange} className="input" />

        {/* Password */}
        <input type="password" name="password" placeholder="Password" value={doctor.password} onChange={handleChange} className="input" required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={doctor.confirmPassword} onChange={handleChange} className="input" required />

        {/* Schedule Management */}
        <h3 className="text-lg font-bold">Schedule</h3>
        <div className="grid grid-cols-3 gap-2">
          <select name="day" value={newSchedule.day} onChange={handleScheduleChange} className="input">
            <option value="">Select Day</option>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input type="time" name="startTime" value={newSchedule.startTime} onChange={handleScheduleChange} className="input" />
          <input type="time" name="endTime" value={newSchedule.endTime} onChange={handleScheduleChange} className="input" />
        </div>
        <button type="button" onClick={addSchedule} className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">Add Schedule</button>

        {/* Show Added Schedules */}
        {doctor.schedule.length > 0 && (
          <ul className="mt-3">
            {doctor.schedule.map((sched, index) => (
              <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md mt-2">
                {sched.day}: {sched.startTime} - {sched.endTime}
                <button type="button" onClick={() => removeSchedule(index)} className="text-red-500">X</button>
              </li>
            ))}
          </ul>
        )}

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">Register Doctor</button>
      </form>
    </div>
  );
};

export default DoctorForm;
