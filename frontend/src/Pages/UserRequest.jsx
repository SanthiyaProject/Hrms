import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import arrow from "../assets/arrow.svg";
import userImg from "../assets/user-1.png";
import axios from "axios";
import { ClipboardMinus } from "lucide-react";
const UserRequest = () => {
  const token = localStorage.getItem("jwtToken");
  const [newUserRequests, setNewUserRequests] = useState([]);
  const [reqData, setReqData] = useState([]);
  const cardData = [
    { email: "nishanth@gmail.com", user_id: 1 },
    { email: "santhiya@gmail.com", user_id: 2 },
    { email: "venkatesh@gmail.com", user_id: 3 },
    { email: "nishanth@gmail.com", user_id: 4 },
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/get_pending_user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setNewUserRequests(response.data);
        console.log("resp :", response.data);
      });
  }, []);

  const handleStatusChange = async (id, email, status) => {
    const data = {
      user_id: id,
      user_email: email,
      status: status,
    };
    try {
      // First API call
      await axios.post(`http://127.0.0.1:8000/api/approve_user/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`User req, resp:`, data);

      // Second API call
      await axios.post(`http://127.0.0.1:8000/api/get_user_request/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(`Status sent to second endpoint: ${status}`);

      // Update UI
      setNewUserRequests((prevRequests) =>
        prevRequests.filter((user) => user.id !== id)
      );
    } catch (error) {
      console.error(`Error updating user status to ${status}:`, error);
    }
    window.location.reload();
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/get_user_request/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("dataaaaa : ", response.data);
        setReqData(response.data);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="container-1 mt-4">
        <div className="breadcrumbs">
          <p className="font-semibold flex items-center gap-2">
            Dashboard <img src={arrow} className="w-4" />{" "}
            <span className="text-blue-400">New User Request</span>
          </p>
        </div>
        {/* ---------Card section----------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
          {newUserRequests.map((item, index) => {
            return (
              <div className="card p-2 rounded-lg border border-gray-400">
                <div className="header flex items-center justify-between">
                  <img src={userImg} alt="" />
                  <div className="button-section bg-gray-200 p-2 rounded-full w-fit flex items-center gap-3">
                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleStatusChange(item.id, item.email, "Approved")
                      }
                    >
                      <svg
                        width="29"
                        height="29"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.3126 28.25C6.45604 28.25 0.0874023 22.0941 0.0874023 14.5C0.0874023 6.90588 6.45604 0.75 14.3126 0.75C22.1692 0.75 28.5379 6.90588 28.5379 14.5C28.5379 22.0941 22.1692 28.25 14.3126 28.25ZM12.8944 20L22.9516 10.2774L20.9402 8.33312L12.8944 16.1115L8.87006 12.2216L6.85861 14.1659L12.8944 20Z"
                          fill="#2EB67D"
                        />
                      </svg>
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleStatusChange(item.id, item.email, "Rejected")
                      }
                    >
                      <svg
                        width="29"
                        height="29"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.6261 28.25C6.76951 28.25 0.400879 22.0941 0.400879 14.5C0.400879 6.90588 6.76951 0.75 14.6261 0.75C22.4827 0.75 28.8513 6.90588 28.8513 14.5C28.8513 22.0941 22.4827 28.25 14.6261 28.25ZM14.6261 12.5558L10.6032 8.66587L8.59034 10.6115L12.6147 14.5L8.59034 18.3885L10.6032 20.3341L14.6261 16.4442L18.649 20.3341L20.6619 18.3885L16.6376 14.5L20.6619 10.6115L18.649 8.66587L14.6261 12.5558Z"
                          fill="#F94144"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="content-container mt-3">
                  <table>
                    <tr className="">
                      <td className="font-semibold">User Name : </td>
                      <td className="px-2 ">{item.username}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Email : </td>
                      <td className="px-2">{item.email}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">User Id : </td>
                      <td className="px-2">{item.id}</td>
                    </tr>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600">
                ID
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">
                User Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">
                User ID
              </th>
            </tr>
          </thead>
          <tbody>
            {reqData.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-6 py-3 text-gray-700">{item.id}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded ${
                      item.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-700">{item.user_email}</td>
                <td className="px-6 py-3 text-gray-700">{item.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserRequest;
