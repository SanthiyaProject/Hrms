import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import ApplyPermissionForm from "./ApplyPermissionForm";
import PermissionEditModal from "./PermissionEditModal";
import PermissionDeleteModal from "./PermissionDeleteModal";

import eye from "../assets/eye-icon-new.svg";

const PermissionTable = () => {
  const [filter, setFilter] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [permissionId, setPermissionId] = useState("");
  const token = localStorage.getItem("jwtToken");
  const decoded = token ? jwtDecode(token) : null;
  const user_id = decoded?.user_id;

  const [permissions, setPermissions] = useState([]); // State to store data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(""); // State to handle errors

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/permission/${user_id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPermissions(response.data); // Store fetched data in state
        console.log("Fetched permissions:", response.data);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setError("Failed to fetch permission data.");
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    if (user_id) {
      fetchPermissions();
    }
  }, [user_id, token]);

  if (loading) return <p>Loading permissions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Filter permissions based on status
  const filteredPermissions = filter
    ? permissions.filter((item) =>
        item.status.toLowerCase().includes(filter.toLowerCase())
      )
    : permissions;

  function openFormHanlder() {
    setOpenForm(true);
  }

  function closeForm() {
    setOpenForm(false);
  }

  function modalHanlder(permission) {
    setSelectedPermission(permission);
    setOpenEditModal(!openEditModal);
  }

  function closeEditModalAndOpenDeleteModal() {
    setDeleteModal(true);
    setOpenEditModal(false);
  }

  function closeDeleteModal() {
    setDeleteModal(false);
  }

  const deletePermission = async (permissionId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/permission/delete/${permissionId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Remove deleted permission from state
      setPermissions(
        permissions.filter(
          (permission) => permission.permission_id !== permissionId
        )
      );
    } catch (error) {
      console.error("Failed to delete permission:", error);
      // Handle error (e.g., show a notification)
    }
  };

  return (
    <>
      <div className="container mx-auto mt-5">
        <div className="flex justify-between mb-4 mt-4">
          <h2 className="text-xl">Approval / Rejected Permission Details</h2>
          <div className="flex items-center gap-4">
            <select
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
              className="p-2 border rounded"
            >
              <option value="">Filter by</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={openFormHanlder}
              className=" bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
            >
              + New Permission
            </button>
          </div>
        </div>

        <div className="table-container border rounded-lg overflow-hidden">
          <table className="w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-[#E2EFF9]">
                <th className="p-2">Date</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((row, index) => (
                <tr key={index} className="text-center even:bg-[#FAFAFA]">
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.time_from}</td>
                  <td className="p-2">{row.time_to}</td>
                  <td className="p-2">{row.reason}</td>
                  <td
                    className={`p-2 ${
                      row.status === "approved"
                        ? "text-green-500 rounded-lg "
                        : "text-red-500"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="p-2">
                    <div
                      onClick={() => {
                        modalHanlder(row);
                      }}
                      className="bg-blue-100 cursor-pointer px-2 py-2 rounded-full w-fit relative left-[50%] translate-x-[-50%]"
                    >
                      <img src={eye} className="m-auto" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {openForm ? <ApplyPermissionForm closeForm={closeForm} /> : ""}
      {openEditModal ? (
        <PermissionEditModal
          modalHanlder={modalHanlder}
          closeEditModalAndOpenDeleteModal={closeEditModalAndOpenDeleteModal}
          selectedPermission={selectedPermission}
        />
      ) : (
        ""
      )}
      {deleteModal ? (
        <PermissionDeleteModal
          closeDeleteModal={closeDeleteModal}
          selectedPermission={selectedPermission}
          deletePermission={deletePermission}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default PermissionTable;
