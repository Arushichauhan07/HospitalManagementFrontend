import React, { useState, useEffect } from "react";

const ScheduleForm = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [schedule, setSchedule] = useState({});

    useEffect(() => {
        fetch("/api/doctors")
            .then((res) => res.json())
            .then((data) => setDoctors(data));
    }, []);

    const handleDayChange = (day) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: prev[day] || [],
        }));
    };

    const addTimeSlot = (day) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: [...(prev[day] || []), { startTime: "", endTime: "" }],
        }));
    };

    const updateSlot = (day, index, field, value) => {
        const updatedSlots = schedule[day].map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setSchedule((prev) => ({ ...prev, [day]: updatedSlots }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDoctor) return alert("Select a doctor");

        const formattedSchedule = Object.entries(schedule).map(([day, slots]) => ({
            day,
            slots: slots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: true,
            })),
        }));

        const response = await fetch(`/api/doctors/${selectedDoctor}/schedule`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schedule: formattedSchedule }),
        });

        if (response.ok) alert("Schedule updated successfully!");
        else alert("Error updating schedule");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Manage Doctor Schedule</h2>

            <select onChange={(e) => setSelectedDoctor(e.target.value)} className="border p-2 w-full">
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} ({doctor.specialization})
                    </option>
                ))}
            </select>

            <div className="mt-4">
                <h3 className="font-semibold">Select Days & Time Slots</h3>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="mb-4 border p-2 rounded">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="mr-2"
                                onChange={() => handleDayChange(day)}
                                checked={schedule[day] !== undefined}
                            />
                            {day}
                        </label>

                        {schedule[day] &&
                            schedule[day].map((slot, index) => (
                                <div key={index} className="flex space-x-2 mt-2">
                                    <input
                                        type="time"
                                        className="border p-1"
                                        value={slot.startTime}
                                        onChange={(e) => updateSlot(day, index, "startTime", e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className="border p-1"
                                        value={slot.endTime}
                                        onChange={(e) => updateSlot(day, index, "endTime", e.target.value)}
                                    />
                                </div>
                            ))}

                        {schedule[day] && (
                            <button
                                type="button"
                                className="text-blue-500 mt-2"
                                onClick={() => addTimeSlot(day)}
                            >
                                + Add Time Slot
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
                Save Schedule
            </button>
        </div>
    );
};

export default ScheduleForm;
