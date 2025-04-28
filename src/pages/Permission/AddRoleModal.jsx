import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {useOutsideClick} from "../../components/hooks/useOutsideClick";
import {  useUpdateRoleMutation } from "../../redux/slices/roleSlice";
import { useGetAllPermissionsQuery } from "../../redux/slices/permissionSlice"

const AddRoleModal = ({ closeAddModal, setIsAddModalOpen, initialRoleData }) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]); // Tracks selected permissions
    const [loading, setLoading] = useState(false);
    // const apiUrl = process.env.REACT_APP_API_URL;
    const { role } = useSelector((state) => state.role);
    const [updateRole] = useUpdateRoleMutation()
    const  {data: allPermissions}  = useGetAllPermissionsQuery()

    // console.log("allPermissions", allPermissions)
    // console.log("initialRoleData", initialRoleData)
    // Extract permission names from initialRoleData
    useEffect(() => {
        // console.log("Initial Role Data:", initialRoleData);
        if (initialRoleData?.permissions) {
            const existingPermissions = initialRoleData.permissions.map((perm) =>
                typeof perm === "string" ? perm : perm.permission_name
            );
            setSelectedPermissions(existingPermissions);
        }
    }, [initialRoleData]);


    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSelectedPermissions((prev) =>
            checked ? [...prev, name] : prev.filter((perm) => perm !== name)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
      
        try {
          const payload = {
            role_name: initialRoleData.role_name,  // You can also allow editing this if needed
            permissions: selectedPermissions,
          };
      
          await updateRole({ id: initialRoleData._id, ...payload }).unwrap();
      
          toast.success("Role updated successfully!");
          closeAddModal();
        } catch (error) {
          console.error("Error updating role:", error);
          toast.error("Failed to update role.");
        } finally {
          setLoading(false);
        }
      };
      
      

    const ref = useOutsideClick(() => {
        closeAddModal(false);
        });
    return (
        <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex items-center justify-center p-4 sm:p-8 min-h-screen">
            <div ref={ref}  className="bg-white rounded-lg shadow-lg p-8 sm:p-10 max-h-[33rem] overflow-y-auto scrollbar-thin w-screen max-w-lg">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-semibold mb-4">
                        {initialRoleData ? "Edit Role Permissions" : "Add Role Permissions"}
                    </h2>
                    <button className="text-gray-500 hover:text-gray-800 text-2xl" onClick={closeAddModal}>
                        &times;
                    </button>
                </div>
                <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role Name</label>
                        <div className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm">
                            {initialRoleData?.role_name}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Permissions</label>
                        <div className="mt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-4"> 
                                {allPermissions?.map((perm, index) => (
                                    <div key={index}>
                                        <input
    type="checkbox"
    id={perm._id}
    name={perm.permission_name}
    value={perm.permission_name}
    checked={selectedPermissions.includes(perm.permission_name)}
    onChange={handleChange}
    className="hidden peer"
/>
<label
    htmlFor={perm._id}
    className="flex items-center justify-between p-3 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50"
>
    <div>
        <div className="text-sm font-semibold">{perm.permission_name}</div>
    </div>
</label>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            className="bg-gray-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-gray-600"
                            onClick={closeAddModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRoleModal;
