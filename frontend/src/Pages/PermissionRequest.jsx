import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import userImg from "../assets/user-1.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PermissionRequestTable from "./PermissionRequestTable";
import { use } from "react";
import PermissionApproveModal from "../components/PermissionApproveModal";
import PermissionRejectModal from "../components/PermissionRejectModal";
const PermissionRequest = () => {
  const [permissionRequest, setPermissionRequest] = useState([]); // All requests
  const [pendingRequests, setPendingRequests] = useState([]); // Pending requests
  const [completedRequests, setCompletedRequests] = useState([]); // Approved & Rejected requests
  const [approveModal, setApproveModal] = useState(false);
  const [approveDetails, setApproveDetails] = useState({});
  const [permissionRejectModal, setPermissionRejectModal] = useState(false);
  const [rejectDetails, setRejectDetails] = useState({});

  // token -----------------------------------
  const token = localStorage.getItem("jwtToken");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/permission/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allRequests = response.data;
        setPermissionRequest(allRequests); // Store all requests

        // Filter pending requests
        const pending = allRequests.filter(
          (request) => request.status.toLowerCase() === "pending"
        );
        setPendingRequests(pending);

        // Filter approved & rejected requests together
        const completed = allRequests.filter(
          (request) =>
            request.status.toLowerCase() === "approved" ||
            request.status.toLowerCase() === "rejected"
        );
        setCompletedRequests(completed);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    };

    if (token) {
      fetchPermissions();
    }
  }, [token]);

  function openApproveModal(item) {
    console.log("item :", item);
    setApproveModal(true);
    setApproveDetails(item);
  }
  function closeApproveModal() {
    setApproveModal(false);
  }

  function handlePermissionReject(item) {
    setPermissionRejectModal(true);
    setRejectDetails(item);
  }
  function closePermissionReject() {
    setPermissionRejectModal(false);
  }

  return (
    <>
      <div className="main-container">
        <Navbar />
        <div className="header-section mt-4">
          <h1 className="font-semibold text-lg">
            Dashboard /{" "}
            <span className="text-blue-400">Permission Request</span>
          </h1>
        </div>
        <div className="content-container mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pendingRequests.map((item) => {
            return (
              <div className="card border rounded-lg p-3 ">
                <div className="header flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <img src={userImg} alt="" />
                    <p className="name font-medium text-lg">Surya Chandran</p>
                  </div>
                  <div className="button-section flex gap-1 items-center bg-[#F3F8FE] px-2 py-2 rounded-full">
                    <div
                      onClick={() => {
                        openApproveModal(item);
                      }}
                      className="approve-btn cursor-pointer"
                    >
                      <svg
                        width="35"
                        height="33"
                        viewBox="0 0 35 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_972_2372)">
                          <path
                            d="M17.3131 30.25C9.45653 30.25 3.08789 24.0941 3.08789 16.5C3.08789 8.90588 9.45653 2.75 17.3131 2.75C25.1697 2.75 31.5384 8.90588 31.5384 16.5C31.5384 24.0941 25.1697 30.25 17.3131 30.25ZM15.8949 22L25.9521 12.2774L23.9407 10.3331L15.8949 18.1115L11.8705 14.2216L9.8591 16.1659L15.8949 22Z"
                            fill="#2EB67D"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_972_2372">
                            <rect
                              width="34.1406"
                              height="33"
                              fill="white"
                              transform="translate(0.242188)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div
                      onClick={() => {
                        handlePermissionReject(item);
                      }}
                      className="reject-btn cursor-pointer"
                    >
                      <svg
                        width="35"
                        height="33"
                        viewBox="0 0 35 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_972_2373)">
                          <path
                            d="M17.6266 30.25C9.77 30.25 3.40137 24.0941 3.40137 16.5C3.40137 8.90588 9.77 2.75 17.6266 2.75C25.4832 2.75 31.8518 8.90588 31.8518 16.5C31.8518 24.0941 25.4832 30.25 17.6266 30.25ZM17.6266 14.5558L13.6037 10.6659L11.5908 12.6115L15.6152 16.5L11.5908 20.3885L13.6037 22.3341L17.6266 18.4442L21.6495 22.3341L23.6624 20.3885L19.638 16.5L23.6624 12.6115L21.6495 10.6659L17.6266 14.5558Z"
                            fill="#F94144"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_972_2373">
                            <rect
                              width="34.1406"
                              height="33"
                              fill="white"
                              transform="translate(0.555664)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="card-container mt-3">
                  <table>
                    <tr>
                      <td className="font-semibold">Date : </td>
                      <td className="pl-4">{item.date}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">From : </td>
                      <td className="pl-4">{item.time_from}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">To: </td>
                      <td className="pl-4">{item.time_to}</td>
                    </tr>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* table  */}

      <PermissionRequestTable completedRequests={completedRequests} />
      {/* {console.log("appr details : ", approveDetails)} */}
      {approveModal ? (
        <PermissionApproveModal
          approveDetails={approveDetails}
          closeApproveModal={closeApproveModal}
        />
      ) : (
        ""
      )}
      {permissionRejectModal ? (
        <PermissionRejectModal
          closePermissionReject={closePermissionReject}
          rejectDetails={rejectDetails}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default PermissionRequest;
