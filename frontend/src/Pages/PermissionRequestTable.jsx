import axios from "axios";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
const PermissionRequestTable = ({ completedRequests }) => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const token = localStorage.getItem("jwtToken");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const [req, setReq] = useState([]);
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/permission/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setReq(response.data);
        console.log("response for req :", response.data);
        // Filter for requests with status 'approved' or 'rejected'
        const approvedOrRejectedRequests = response.data.filter(
          (item) => item.status === "approved" || item.status === "rejected"
        );
        console.log("appr/rej : ", approvedOrRejectedRequests);
        setFilteredRequests(approvedOrRejectedRequests);
      });
  }, [token]);
  return (
    <>
      <div className="overflow-x-auto mt-4 rounded-lg">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300">
                Employee Name
              </th>

              <th className="px-6 py-3 border-b border-gray-300 text-lg">
                From
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-lg">To</th>
              <th className="px-6 py-3 border-b border-gray-300 text-lg">
                Status
              </th>
              {/* <th className="px-6 py-3 border-b border-gray-300">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {console.log("fil : ", filteredRequests)}
            {filteredRequests.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-3 border-b">{item.user_name}</td>
                <td className="px-6 py-3 border-b">{item.time_from}</td>
                <td className="px-6 py-3 border-b">{item.time_to}</td>
                <td
                  className={`px-6 py-3 border-b ${
                    item.status === "approved"
                      ? "text-green-500 "
                      : "text-red-500"
                  }`}
                >
                  {item.status}
                </td>
                {/* <td className="px-6 py-3 border-b">
                  <button className="text-blue-500 hover:underline">🔍</button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PermissionRequestTable;
