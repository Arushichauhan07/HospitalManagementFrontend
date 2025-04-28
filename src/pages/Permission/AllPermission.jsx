import React, { useEffect, useState } from "react";
import Table from "../../components/utilis/Table";
import axios from "axios";
import { toast } from "react-toastify";
// import { useRole } from "../../context/RoleContext";
import { useSelector } from "react-redux";
import AddPermissionModal from "./AddPermission";
import { useGetAllPermissionsQuery } from "../../redux/slices/permissionSlice"

const AllPermission = () => {
    const [permissions, setPermissions] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [initialPermissionData, setInitialPermissionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filteredPermissions, setFilteredPermissions] = useState([]);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const { role } = useSelector((state) => state.role);
    const isSuperAdmin = role === "superadmin";
    const isAdmin = role === "admin";
    const  {data: allPermissions}  = useGetAllPermissionsQuery()


    // Fetch permissions
    // const fetchPermissions = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`${apiUrl}/api/permissions`, {
    //             withCredentials: true,
    //         });
    //         setPermissions(response.data);
    //         setFilteredPermissions(response.data);
    //     } catch (error) {
    //         toast.error("Error fetching permissions");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        setPermissions(allPermissions);
        setFilteredPermissions(allPermissions);
    }, [allPermissions]);

    // const handleReload = () => {
    //     fetchPermissions();
    // };

    const handlePermissionEntriesChange = (value) => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const columns = [
        ...((isSuperAdmin || isAdmin) ? ([{ header: "Organization ID", accessor: "org_id" }]) : []),
        // { header: "ID", accessor: "_id" },
        { header: "Permission Name", accessor: "permission_name" },
        { header: "Created At", accessor: "createdAt" },
    ];

    const actions = [
        ...((isSuperAdmin || isAdmin)
            ? ([
                {
                    label: "📝 Add New Permission",
                    onClick: () => {
                        setIsAddModalOpen(true);
                        setInitialPermissionData(null);
                    },
                },
            ])
            : []),
    ];

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        // fetchPermissions();
    };
    const handleSearch = (value) => {
        setFilteredPermissions(
            permissions.filter((permission) =>  // Filter the permissions based on the search value
                permission.permission_name.toLowerCase().includes(value.toLowerCase()) ||
                permission.org_id.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
      }; 
      const startIndex = (currentPage - 1) * entriesPerPage;
    const PermissionpaginatedData = filteredPermissions?.slice(startIndex, startIndex + entriesPerPage); 

    return (
        <div className="p-4">
            <Table
                title="Permissions Table"
                columns={columns}
                data={PermissionpaginatedData}
                actions={actions}
                onSearch={(value) => handleSearch(value)}
                onRowClick={
                    (row) => {
                        (isSuperAdmin || isAdmin) && setIsAddModalOpen(true);
                        (isSuperAdmin || isAdmin) && setInitialPermissionData(row);
                    }

                }
                currentPage={currentPage}
                totalPages={Math.ceil(filteredPermissions?.length / entriesPerPage)}
                onPageChange={handlePageChange}
                totalEntries={filteredPermissions?.length}
                entriesPerPage={entriesPerPage}
                onEntriesChange={handlePermissionEntriesChange}
                entriesOptions={[5, 10, 25, 50, 100, permissions?.length]}
                exportButton={false}
                loading={loading}
            />
            {isAddModalOpen && <AddPermissionModal closeAddModal={closeAddModal} setIsAddModalOpen={setIsAddModalOpen} initialPermissionData={initialPermissionData} />}

        </div>
    );
};

export default AllPermission;
