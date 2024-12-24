import React, {
  useState,
  useEffect,
  useContext,
  useReducer,
  useRef,
} from "react";
import Navbar from "../components/Navbar.jsx";
import arrow from "../assets/arrow.svg";
import search from "../assets/search-icon.svg";
import closeIcon from "../assets/close-icon.svg";
import userImg from "../assets/user-1.png";
import eye from "../assets/eye-icon-new.svg";
import emptyImg from "../assets/emptyBg.svg";
import AdminEditModal from "../components/AdminEditModal.jsx";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import RejectLeaveModal from "../components/RejectLeaveModal"; // Import the modal component
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Axis3D } from "lucide-react";
import ApprovalModal from "../components/ApprovalModal.jsx";

const AdminLeaveRequest = () => {
  const tableRef = useRef();
  const token = localStorage.getItem("jwtToken");
  const [openAdminEditModal, setOpenAdminEditModal] = useState(false);
  const [adminTint, setAdminTint] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filter, setFilter] = useState(""); // State to hold the selected filter
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [adminLeave, setAdminLeave] = useState([]);
  const [alert, setAlert] = useState(false);
  const [rejectedAlert, setRejectedAlert] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false); // State for the reject modal
  const [rejectTint, setRejectTint] = useState(false);
  const [startDate, setStartDate] = useState(""); // For 'From' date
  const [endDate, setEndDate] = useState(""); // For 'To' date
  const [approveDetails, setApproveDetails] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [empId, setEmpId] = useState(0);
  const [employee_name, setEmployee_name] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // department filter 
  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
};
  
  // changes made
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] =
    useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Page not found");
      setShowNotFound(true);
      navigate("/");
    }
  }, []);

  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;

  useEffect(() => {
    // Make an API call to get leave request data
    axios
      .get("http://127.0.0.1:8000/api/admin_leave/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Store the response data in state
        setAdminLeave(response.data);
        console.log("response from admin leave table data : ", response.data);
      })
      .then(() => {
        axios
          .get(`http://127.0.0.1:8000/api/get_username/${user_id}/`, {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token for authorization
            },
          })
          .then((response) => {
            console.log("resp for emp id : ", response.data.username);
            setEmployee_name(response.data.username);
          });
      })
      .catch((error) => {
        // Handle any errors for the GET request
        console.error("There was an error fetching the leave requests!", error);
      });
  }, []); // Replace with your actual API URL

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  // Filter the leave requests based on the selected filter
  // const filteredLeaveRequests = adminLeave.filter((leave) => {
  //   const leaveStartDate = new Date(leave.fromDate);
  //   const leaveEndDate = new Date(leave.toDate);

  //   // Status filter
  //   if (filter && leave.status !== filter) {
  //     return false;
  //   }

  //   // Date range filter
  //   if (startDate && leaveStartDate < new Date(startDate)) {
  //     return false;
  //   }
  //   if (endDate && leaveEndDate > new Date(endDate)) {
  //     return false;
  //   }

  //   return true; // Pass all filters
  // });

  const filteredLeaveRequests = adminLeave.filter((leave) => {
    const leaveStartDate = new Date(leave.fromDate);
    const leaveEndDate = new Date(leave.toDate);

    // Status filter
    if (filter && leave.status !== filter) {
        return false;
    }

    // Department filter
    if (departmentFilter && leave.user_department !== departmentFilter) {
        return false;
    }

    // Date range filter
    if (startDate && leaveStartDate < new Date(startDate)) {
        return false;
    }
    if (endDate && leaveEndDate > new Date(endDate)) {
        return false;
    }

    return true; // Pass all filters
});



  function openAdminModalHandler(leave) {
    setOpenAdminEditModal(true);
    setSelectedLeave(leave);
  }

  const [leavDetails, setLeaveDetails] = useState(null);
  const openRejectModalHandler = (leave) => {
    setLeaveDetails(leave);
    setSelectedLeave(leave);
    setOpenRejectModal(true); // Open the reject modal
    setRejectTint(true);
  };

  useEffect(() => {
    // Make an API call to get leave request data
    axios
      .get("http://127.0.0.1:8000/api/leave/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const allRequests = response.data;

        const pendingRequests = allRequests.filter(
          (item) => item.status == "Pending"
        );
        setLeaveRequest(pendingRequests);
        console.log("pending rewquest :", pendingRequests);
      })
      .catch((error) => {
        console.error("There was an error fetching the leave requests!", error);
      });
  }, []);

  function showConfirmation(details) {
    console.log("function has been called :", details);
    setConfirmationData(details);
    setApproveDetails(true);
  }
  function handleCloseConfirmation() {
    setApproveDetails(false);
  }

  function OModal() {
    setOpenRejectModal(true);
  }
  const handleClick = async (leaveData, status, reason) => {
    // showConfirmation(leaveData);
    // setTimeout(() => {
    //   setApproveDetails(false);
    // }, 2000);

    try {
      // Construct the payload with updated status and reason (for rejection)
      const payload = {
        ...leaveData,
        status, // Set the status ("Approved" or "Rejected")
        reason, // Add the rejection reason
      };
      console.log("payload : ", payload);
      // First API call (PUT request)
      const updateResponse = await axios.put(
        `http://127.0.0.1:8000/api/leave/approve/${leaveData.leave_id}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Payload from the frontend for PUT:", payload);

      if (updateResponse.status === 200) {
        console.log(`Leave request ${status} successfully updated:`, payload);

        // Second API call (POST request)
        const createResponse = await axios.post(
          `http://127.0.0.1:8000/api/admin_leave/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("reason ::::::::::::: ", reason);
        if (status == "Approved") {
          console.log("approveing     ");
          setAlert(true);
          setTimeout(() => {
            setAlert(false);
          }, 3000);
        }
        if (status == "Rejected") {
          // setOpenRejectModal(true);
          setRejectedAlert(true);
          setTimeout(() => {
            setRejectedAlert(false);
          }, 3000);
        }
        console.log("Payload from the frontend for POST:", payload);

        if (createResponse.status === 201) {
          console.log(`Leave data successfully posted:`, payload);

          // Optionally, refresh the leave requests or update the local state
          setLeaveRequest((prevRequests) =>
            prevRequests.map((request) =>
              request.id === leaveData.id ? { ...request, status } : request
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error processing leave request to ${status}:`, error);
    }
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  function handlePrint() {
    const doc = new jsPDF();
    doc.autoTable({ html: tableRef.current });
    doc.save("Leavelist.pdf");
  }

  // changes made

  const openApprovalModalHandler = (leave) => {
    setSelectedLeaveForApproval(leave);
    setOpenApprovalModal(true); // Open the approval modal
  };

  const [approveAlert, setApproveAlert] = useState(false);

  const handleApproveLeave = async () => {
    try {
      const payload = { ...selectedLeaveForApproval, status: "Approved" }; // Update status
  
      // Second request: Create a new leave entry (admin_leave)
      const createResponse = await axios.post(
        `http://127.0.0.1:8000/api/admin_leave/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // First request: Approve the leave
      await axios.put(
        `http://127.0.0.1:8000/api/leave/approve/${selectedLeaveForApproval.leave_id}/`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Optionally refresh data or update local state
      setOpenApprovalModal(false); // Close modal after approval
      setApproveAlert(true); // Show approval alert
  
      // Wait for 2 seconds, hide the alert, and refresh the page
      setTimeout(() => {
        setApproveAlert(false); // Hide the alert after 2 seconds
        window.location.reload(); // Refresh after alert disappears
      }, 2000);
  
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };
  

  return (
    <>
      {openApprovalModal && (
        <ApprovalModal
          open={openApprovalModal}
          onClose={() => setOpenApprovalModal(false)}
          leaveDetails={selectedLeaveForApproval}
          onApprove={handleApproveLeave}
        />
      )}

      <div
        className={
          approveAlert
            ? "approve-success text-white bg-green-400 px-3 py-1 rounded-lg fixed right-0 top-[20%] transition-all duration-300"
            : "right-[-300px] hidden"
        }
      >
        Leave Approved !!
      </div>

      {approveDetails ? (
        <div className="z-[200] approve-details rounded-lg fixed top-[20%] left-[50%]  translate-x-[-50%] bg-white w-[300px] p-5 text-lg shadow-2xl">
          {/* <div className="close-button bg-gray-300 p-2 w-fit rounded-full ">
          <img src={closeIcon} alt="" />
        </div> */}
          <table className="line-height-200">
            <tr>
              <td>Employee Name : </td>
              <td>{employee_name}</td>
            </tr>
            <tr>
              <td>Employee ID :</td>
              <td>{confirmationData.employee}</td>
            </tr>
            <tr>
              <td>From :</td>
              <td>{confirmationData.fromDate}</td>
            </tr>
            <tr>
              <td>To :</td>
              <td>{confirmationData.fromDate}</td>
            </tr>
            <tr>
              <td>Reason :</td>
              <td>{confirmationData.notes}</td>
            </tr>
          </table>
        </div>
      ) : (
        ""
      )}
      {showNotFound ? (
        <div>Page not found</div>
      ) : (
        <>
          <Navbar />

          <div className="main-container mt-3">
            <div className="breadcrumbs">
              <p className="flex items-center gap-2 font-semibold text-lg">
                Dashboard <img src={arrow} className="w-4" />{" "}
                <span className="text-[#2986CE]">Leave Request</span>
              </p>
            </div>
            <div className="searchbox-container mt-2">
              <div className="search-bar flex gap-3 border w-[100%] sm:w-[500px] px-2 py-1 rounded-lg">
                <img src={search} alt="" />
                <input
                  type="text"
                  placeholder="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg bg-transparent outline-none w-[100%]"
                />
              </div>
            </div>
            {/* ------------Leave Requests------------  */}
            <div className="leave-request-container mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4 h-fit overflow-auto pr-2">
              {leaveRequest.length > 0
                ? leaveRequest.map((item, index) => (
                    <div
                      className="card border rounded-lg p-3 h-fit"
                      key={index}
                    >
                      <div className="header flex items-center justify-between">
                        <div className="img-container-profile-container flex items-center gap-2">
                          <img src={item.img} alt="" />
                          <p className="font-semibold text-lg">
                            {item.user_name}
                          </p>
                        </div>
                        <div className="button-section bg-gray-100 p-2 rounded-full flex gap-3 items-center w-fit">
                          <div
                            onClick={() => openApprovalModalHandler(item)}
                            // changes made
                            className="approve-btn cursor-pointer"
                          >
                            <svg
                              width="29"
                              height="29"
                              viewBox="0 0 29 29"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.3131 28.25C6.45653 28.25 0.0878906 22.0941 0.0878906 14.5C0.0878906 6.90588 6.45653 0.75 14.3131 0.75C22.1697 0.75 28.5384 6.90588 28.5384 14.5C28.5384 22.0941 22.1697 28.25 14.3131 28.25ZM12.8949 20L22.9521 10.2774L20.9407 8.33312L12.8949 16.1115L8.87055 12.2216L6.8591 14.1659L12.8949 20Z"
                                fill="#2EB67D"
                              />
                            </svg>
                          </div>
                          <div
                            onClick={() => {
                              openRejectModalHandler(item); // Open reject modal
                            }}
                            className="reject-btn cursor-pointer"
                          >
                            <svg
                              width="29"
                              height="29"
                              viewBox="0 0 29 29"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6266 28.25C6.77 28.25 0.401367 22.0941 0.401367 14.5C0.401367 6.90588 6.77 0.75 14.6266 0.75C22.4832 0.75 28.8518 6.90588 28.8518 14.5C28.8518 22.0941 22.4832 28.25 14.6266 28.25ZM14.6266 12.5558L10.6037 8.66587L8.59083 10.6115L12.6152 14.5L8.59083 18.3885L10.6037 20.3341L14.6266 16.4442L18.6495 20.3341L20.6624 18.3885L16.638 14.5L20.6624 10.6115L18.6495 8.66587L14.6266 12.5558Z"
                                fill="#F94144"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="body-content mt-2">
                        <table>
                          <tr className="text-[14px] ">
                            <td className="font-semibold">Leave Date : </td>
                            <td className="pl-2">
                              {item.fromDate} - {item.toDate}
                            </td>
                          </tr>
                          <tr className="text-[14px] mt-1">
                            <td className="font-semibold">Leave Type :</td>
                            <td className="pl-2">{item.leave_type}</td>
                          </tr>
                          <tr className="text-[14px] mt-1">
                            <td className="font-semibold">Time period :</td>
                            <td className="pl-2">{item.time_period}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  ))
                : ""}
              {leaveRequest.length > 0 ? (
                ""
              ) : (
                <div>
                  <div className="no-results text-center mt-4 text-xl m-auto translate-x-[400px] ">
                    <img src={emptyImg} className="w-fit m-auto" />
                    <p className="mt-2">No leaves requests found !!</p>
                  </div>
                </div>
              )}
            </div>

            {/* ----------Approved or Rejected List----------------------  */}
            <div className="breadcrumbs mt-10 flex items-center gap-5 ">
              <p className="font-semibold">Approval / Rejected list Details</p>
              <div className="filter-section">
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="w-[100px] border p-1 rounded-lg"
                >
                  <option value="">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="filter-section">
    <select value={departmentFilter} onChange={handleDepartmentFilterChange} className="w-[300px] border p-1 rounded-lg">
        <option value="">All Departments</option>
        <option value="HR">HR</option>
        <option value="IT">IT</option>
        <option value="Sales">Sales</option>
        <option value="Management">Management</option>
        {/* Add more departments as needed */}
    </select>
</div>
              <div className="date-filter-section flex items-center gap-2">
                <label htmlFor="" className="font-semibold">
                  From :
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-4 outline-none border px-2 py-1"
                />
                <label htmlFor="" className="font-semibold">
                  To :
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-4 outline-none border px-2 py-1"
                />
                {/* <button
                  className="bg-gray-100 px-2 py-1 font-semibold"
                >
                  Filter
                </button> */}
              </div>
              <button
                onClick={handlePrint}
                className="bg-gray-100 px-3 py-1 font-medium text-lg w-[100px]"
              >
                Print
              </button>
            </div>
            <div className="container-table overflow-auto h-[300px] hide-scrollbar mt-5">
              <table
                ref={tableRef}
                className="bg-white w-full h-[100%] overflow-auto rounded-lg mt-3 hide-scrollbar"
              >
                <thead>
                  <tr className="bg-[#e2eff9] text-gray-800 text-sm uppercase leading-normal">
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      Employee Name
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      Department
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      Leave Type
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      From
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      To
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      Reason
                    </th>
                    <th className="py-3 px-2 text-left max-sm:text-[12px]">
                      Status
                    </th>
                    <th className="py-3 px-2 text-center max-sm:text-[12px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {filteredLeaveRequests.length > 0 ? (
                    filteredLeaveRequests.map((leave, index) => (
                      <tr
                        key={index}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-2">{leave.user_name}</td>
                        <td className="py-2 px-2">{leave.user_department}</td>
                        <td className="py-3 px-2">{leave.leave_type}</td>
                        <td className="py-3 px-2">{leave.fromDate}</td>
                        <td className="py-3 px-2">{leave.toDate}</td>
                        <td className="py-3 px-2">
                          {leave.notes || "No reason provided"}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-3 py-1 text-md rounded-lg ${
                              leave.status === "Rejected"
                                ? "bg-red-50 text-red-400"
                                : "bg-green-50 text-green-400"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => {
                              openAdminModalHandler(leave);
                            }}
                            className="bg-[#E3F3FF] px-[8px] py-[9px] rounded-full hover:text-blue-700"
                          >
                            <img src={eye} className="w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-3 px-2 text-center text-gray-500"
                      >
                        No leaves found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {adminTint ? (
            <div className="admin-tint fixed right-0 left-0 top-0 bottom-0"></div>
          ) : (
            ""
          )}
          {openAdminEditModal ? (
            <AdminEditModal
              openAdminEditModal={openAdminEditModal}
              setOpenAdminEditModal={setOpenAdminEditModal}
              setAdminTint={setAdminTint}
              adminTint={adminTint}
              selectedLeave={selectedLeave}
            />
          ) : (
            ""
          )}
          {openRejectModal ? (
            <RejectLeaveModal
              openRejectModal={openRejectModal}
              setOpenRejectModal={setOpenRejectModal}
              selectedLeave={selectedLeave}
              leavDetails={leavDetails}
              rejectTint={rejectTint}
              setRejectTint={setRejectTint}
              handleRejectLeave={(reason) =>
                handleClick(selectedLeave, "Rejected", reason)
              } // Pass rejection reason here
            />
          ) : (
            ""
          )}
          {alert ? (
            <div className="alert bg-green-300 text-white rounded-lg px-3 py-2 w-[240px] font-semibold text-[13px] fixed right-[-100%] top-[13%] animate-slide-in">
              <div className="flex items-center gap-3">
                <div className="icon-container border border-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    className="bi bi-check-lg"
                    viewBox="0 0 16 16"
                  >
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                  </svg>
                </div>
                <div>
                  <p>Success</p>
                  <p>Approval Granted!</p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {rejectedAlert ? (
            <div className="alert bg-red-300 text-white rounded-lg px-3 py-2 w-[240px] font-semibold text-[13px] fixed right-[-100%] top-[13%] animate-slide-in">
              <div className="flex items-center gap-3">
                <div className="icon-container border border-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="white"
                    className="bi bi-x"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                </div>
                <div>
                  <p>Rejected</p>
                  <p>Request Denied</p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
};

export default AdminLeaveRequest;
