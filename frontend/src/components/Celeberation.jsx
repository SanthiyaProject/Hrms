import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import { Data } from "../context/store";
import bg from "../assets/greetings-bg.png";
import { Gift, Briefcase } from "lucide-react";
import inboxImg from "../assets/inbox-img.png";
import StatCard from "../components/StatCard";
import DashboardHolidays from "../components/DashboardHolidays";

const Celeberation = () => {
  const celebrations = [
    { id: 1, name: "Surya Chandran", type: "Birthday", date: "APR 27" },
    { id: 2, name: "Surya Chandran", type: "Work Anniversary", date: "APR 27" },
    { id: 3, name: "Surya Chandran", type: "Birthday", date: "APR 27" },
    { id: 4, name: "Surya Chandran", type: "Work Anniversary", date: "APR 27" },
    { id: 5, name: "Surya Chandran", type: "Birthday", date: "APR 27" },
  ];
  return (
    <>
      <div className="mx-auto w-[100%] md:w-[90%] border h-[322px] rounded-xl overflow-auto hide-scrollbar">
        <div className="px-4 py-1 ">
          <div className="flex items-center justify-between mb-6 sticky top-0 pt-3 bg-white pb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Celebrations
            </h2>
            <select className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All</option>
              <option value="birthday">Birthday</option>
              <option value="work">Work Anniversary</option>
            </select>
          </div>

          <div className="space-y-4 mt-[-20px]">
            {celebrations.map((celebration) => (
              <div
                key={celebration.id}
                className="flex items-center space-x-4 p-3 bg-[#FAFAFA] hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                <div className="flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt={celebration.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {celebration.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {celebration.type === "Birthday" ? (
                      <Gift className="w-4 h-4 text-purple-500" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-green-500" />
                    )}
                    <p className="text-sm text-gray-500">{celebration.type}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 ">
                  <span className="text-sm font-medium text-blue-500">
                    {celebration.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Celeberation;
