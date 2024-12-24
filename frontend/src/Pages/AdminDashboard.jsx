import { Link, NavLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Data } from "../context/store";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import upcomingLeaveBg from "../assets/upcoming-leave-request-bg.svg";
import ticketBg from "../assets/ticket-request-bg.svg";
import bg from "../assets/greetings-bg.png";
import { Gift, Briefcase } from "lucide-react";
import userReqBg from "../assets/new-request-bg.svg";
import inboxImg from "../assets/inbox-img.png";
import StatCard from "../components/StatCard";
import DashboardHolidays from "../components/DashboardHolidays";
import AdminStatCard from "../components/AdminStatCard";
import Celeberation from "../components/Celeberation";
import AdminDashboardHolidays from "../components/AdminDashboardHolidays";

const AdminDashboard = () => {
  const { userName, setUserName } = useContext(Data);
  const [userReq, setUserReq] = useState([]);
  const token = localStorage.getItem("jwtToken");
  const [leaveRequest, setLeaveRequest] = useState(0);
  let totlaLeaveRequest = 0;

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/get_pending_user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserReq(response.data);
        console.log("resp :", response.data);
      });
  }, []);

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
        console.log("all requests :", allRequests);
        const pending = allRequests.filter((item) => item.status == "Pending");
        totlaLeaveRequest = pending.length;
        setLeaveRequest(totlaLeaveRequest);
        const pendingRequests = allRequests.filter(
          (item) => item.status == "Pending"
        );
        // setLeaveRequest(pendingRequests);
      })
      .catch((error) => {
        console.error("There was an error fetching the leave requests!", error);
      });
    console.log("leave request  :", leaveRequest);
  }, []);

  return (
    <>
      <div className="main-container">
        <Navbar />
        <div className="first-section lato mt-4 grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-3 ">
          <div className="greetings-section lato bg-[#FAFAFA] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="weight-500 text-[24px] text-[#222222] font-semibold">
                Permission Request
              </h1>
              <p className="name  weight-600 text-[#2986CE] text-[24px]">
                2
              </p>
              <p className="text-[14px] text-[#222222] w-[100%] ">
                Welcome aboard! We're thrilled to have you with us and look
                forward to working together to achieve success!
              </p>
              <Link to="/permissionRequest">
                <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                  Click to open
                </button>
              </Link>
            </div>
            <div className="second-container ">
              <img src={bg} className="w-[240px] " />
            </div>
          </div>

          {/* ------New User Request---------  */}
          <div className="inbox-section bg-[#F5FAFD] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="text-[24px]">New User Request</h1>
              <h1 className="text-[#2986CE] text-[24px] weight-400">
                {userReq.length}
              </h1>
              <p className="text-[14px] w-[100%]">
                Monitor, manage, and respond to all user requests efficiently
                from the centralized admin dashboard.
              </p>
              <Link to="/UserRequest">
                <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                  Click to open
                </button>
              </Link>
            </div>
            <div className="img-container">
              <img src={userReqBg} className="w-[240px] " />
            </div>
          </div>

          <div className="inbox-section bg-[#F5FAFD] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="text-[24px]">Inbox</h1>
              <h1 className="text-[#2986CE] text-[24px] weight-400">17</h1>
              <p className="text-[14px] w-[100%]">
                Tasks waiting for your approval. Please click on take action for
                more details.
              </p>
              <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                Click to open
              </button>
            </div>
            <div className="img-container">
              <img src={inboxImg} className="w-[240px] " />
            </div>
          </div>
        </div>
        {/* -----second container -----  */}

        <div className="first-section lato mt-4 grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-3 ">
          <div className="greetings-section lato bg-[#F5FAFD] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="weight-500 text-[24px] text-[#222222] font-semibold">
                Upcoming Leave Requests
              </h1>
              <p className="name  weight-600 text-[#2986CE] text-[24px]">
                {leaveRequest}
              </p>
              <p className="text-[14px] text-[#222222] w-[80%] ">
                Tasks waiting for your approval. Please click on take action for
                more details.
              </p>
              <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                <Link to="/AdminLeaveRequests">Click to open</Link>
              </button>
            </div>
            <div className="second-container ">
              <img src={upcomingLeaveBg} className="w-[240px] " />
            </div>
          </div>

          {/* ------Ticket Request---------  */}
          <div className="inbox-section bg-[#F5FAFD] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="text-[24px]">Ticket Request</h1>
              <h1 className="text-[#2986CE] text-[24px] weight-400">15</h1>
              <p className="text-[14px] w-[100%]">
                Seamlessly track, prioritize, and resolve ticket requests to
                ensure efficient user support and satisfaction.
              </p>
              <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                Click to open
              </button>
            </div>
            <div className="img-container">
              <img src={ticketBg} className="w-[240px] " />
            </div>
          </div>
          {/* --------------Attedance Regularize Request------------- */}
          <div className="inbox-section bg-[#F5FAFD] flex items-center p-5 rounded-lg">
            <div className="first-container">
              <h1 className="text-[24px]">Attedance Regularize Request</h1>
              <h1 className="text-[#2986CE] text-[24px] weight-400">10</h1>
              <p className="text-[14px] w-[80%]">
                Tasks waiting for your approval. Please click on take action for
                more details.
              </p>
              <button className="bg-[#2986CE] text-[#FFFFFF] rounded-lg text-[14px] weight-600 px-3 py-2 mt-2 hover:bg-blue-500">
                Click to open
              </button>
            </div>
            <div className="img-container">
              <img src={upcomingLeaveBg} className="w-[240px] " />
            </div>
          </div>
        </div>
        {/* ----------------Section-3-----------  */}
        <div className="section-3 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2">
          <AdminStatCard />
          <Celeberation />
          <AdminDashboardHolidays />
          {/* <DashboardHolidays /> */}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
