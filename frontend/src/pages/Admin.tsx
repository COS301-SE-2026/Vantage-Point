// components/AdminUserManagement.tsx
import { useState } from "react";

const users = [
  { name: "John", email: "john.smith@gmail.com", username: "jonny77", status: "Active", role: "Admin", joined: "March 12, 2023", lastActive: "1 minute ago", statusColor: "bg-green-600" },
  { name: "Daniel", email: "dwarren3@gmail.com", username: "dwarren3", status: "Banned", role: "Player", joined: "January 8, 2024", lastActive: "4 days ago", statusColor: "bg-red-600" },
  { name: "Chloe", email: "chloehhye@gmail.com", username: "chloehh", status: "Pending", role: "Admin", joined: "October 5, 2021", lastActive: "10 days ago", statusColor: "bg-[#021247]" },
  { name: "Marcus", email: "reeds777@gmail.com", username: "reeds7", status: "Suspended", role: "Player", joined: "February 19, 2023", lastActive: "3 months ago", statusColor: "bg-orange-500" },
  { name: "Isabelle", email: "belleclark@gmail.com", username: "bellecl", status: "Active", role: "Super Admin", joined: "August 30, 2022", lastActive: "1 week ago", statusColor: "bg-green-600" },
  { name: "Lucas", email: "lucamich@gmail.com", username: "lucamich", status: "Active", role: "Player", joined: "April 23, 2024", lastActive: "4 hours ago", statusColor: "bg-green-600" },
  { name: "Mark", email: "markwill32@gmail.com", username: "markwill32", status: "Banned", role: "Player", joined: "November 14, 2020", lastActive: "2 months ago", statusColor: "bg-red-600" },
  { name: "Nicholas", email: "nicolass009@gmail.com", username: "nicolass009", status: "Suspended", role: "Admin", joined: "July 6, 2023", lastActive: "3 hours ago", statusColor: "bg-orange-500" },
  { name: "Mia", email: "mianaddiin@gmail.com", username: "mianaddiin", status: "Inactive", role: "Admin", joined: "December 31, 2021", lastActive: "4 months ago", statusColor: "bg-gray-400" },
  { name: "Noemi", email: "noemivill99@gmail.com", username: "noemi", status: "Active", role: "Player", joined: "August 10, 2024", lastActive: "15 minutes ago", statusColor: "bg-green-600" },
];

const navItems = ["Dashboard", "Users", "Match Data", "Map Assets", "Champion Assets", "Settings"];

export default function AdminUserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#f0f0f0] rounded-r-2xl
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:flex flex-col py-6 px-5
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-cover bg-center rounded-full overflow-hidden">
            <img
              src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/22d05d19-b2f8-468a-962d-edcf1b217ec3"
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm lg:text-base font-[League] text-[#1e1e1e]">
            Vantage Point
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item === "Users"
                  ? "bg-[#dadada] font-bold text-[#1e1e1e]"
                  : "text-[#1e1e1e] hover:bg-[#dadada]/70"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="mt-auto text-left px-3 py-2 rounded-lg text-sm text-[#1e1e1e] hover:bg-[#dadada]/70">
          Log out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl lg:text-2xl font-[League] text-black">
            User Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg bg-white shadow"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/00ec255a-0971-49dd-a43e-837f8fe5d7aa"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden lg:inline text-sm font-medium">UN</span>
          </div>
        </header>

        {/* Filter bar */}
        <div className="bg-[#f9fafb] border-b border-[#b3b6bc] rounded-t-lg px-3 py-2 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {["Role", "Status", "Date"].map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#a9b4be] text-xs text-[#2e4258] cursor-pointer"
              >
                <img
                  src={`https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/${
                    filter === "Role" ? "1e7a89de-fca9-475a-a483-24eec2bed827"
                    : filter === "Status" ? "0f74ec55-159b-42d6-8f97-4b1c3ac27fab"
                    : "26d5e09e-d26e-4cf6-a578-bb51fe0d354f"
                  }.png`}
                  alt=""
                  className="w-3 h-3"
                />
                <span>{filter}</span>
                <svg className="w-2 h-2 ml-0.5" viewBox="0 0 5.374 3.224">
                  <path d="M0 0L2.687 3.224L5.374 0Z" fill="currentColor" />
                </svg>
              </div>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#a9b4be] text-xs text-[#2e4258]">
              <img
                src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/f0a0e4d4-b0b6-4877-88e9-9bb74b9f8b15.png"
                alt=""
                className="w-3 h-3"
              />
              Export
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#2e4258] border border-[#c7c8c9] text-xs font-medium text-[#f3f8ff]">
              <img
                src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/fffbdcc2-a390-482c-9ef8-f0f7a12a2549.png"
                alt=""
                className="w-3 h-3"
              />
              Register User
            </button>
          </div>
        </div>

        {/* Table container with horizontal scroll on small screens */}
        <div className="bg-white rounded-b-lg shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead>
              <tr className="border-b border-[#d9ebfe]">
                {["name", "Email", "Username", "Status", "Role", "Joined Date", "Last Active", "Actions"].map((col) => (
                  <th key={col} className="px-3 py-2 text-[8.696px] font-medium text-[#757575] uppercase text-left">
                    <div className="flex items-center gap-1">
                      {col}
                      <svg className="w-2 h-2" viewBox="0 0 7.454 9.938">
                        <path d="M3.727 0L7.454 3.727H0ZM3.727 9.938L0 6.211h7.454Z" fill="rgba(217,235,254,1)" />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/svg/d0577be549c17c61ddc923131c622e1f.svg"
                          alt=""
                          className="w-full h-full"
                        />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/6bcd52f3-47c1-4d95-821b-0660d361d27d')" }} />
                      <span className="text-[#3b5571]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{user.email}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{user.username}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-white text-[8.696px] ${user.statusColor}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{user.role}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{user.joined}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{user.lastActive}</td>
                  <td className="px-3 py-2.5">
                    <div className="w-16 h-6 bg-cover bg-center" style={{ backgroundImage: `url('https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/${i === 0 ? 'fa39442d-da76-41a6-b8dc-16653117a6b3' : i === 1 ? '7ad05634-5890-4e77-8c68-fdfa9794bee9' : '004cc74e-8d86-4ee8-a924-b92c813e3255'}.png')` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#2e4258] font-medium">Rows per page</span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#ddd]">
              <span>10</span>
              <svg className="w-2.5 h-2.5" viewBox="0 0 9.938 9.938">
                <path d="M0 0L4.969 4.969L9.938 0V9.938H0Z" fill="#2e4258" />
              </svg>
            </div>
            <span className="text-[#2e4258] font-medium">of 140 rows</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <img src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/64a08ce2-b4c5-4093-b6a1-0bf536a9a5e9.png" alt="" className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <img src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/12353f19-6ec1-441b-8988-0cb6e068ca20.png" alt="" className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  page === 1 ? "bg-[#2e4258] text-white" : "bg-white text-[#2e4258] border border-[#f1f1f1]"
                }`}
              >
                {page}
              </button>
            ))}
            <span className="text-[8px] font-bold text-[#2e4258]">...</span>
            <button className="w-5 h-5 rounded-full bg-white border border-[#f1f1f1] flex items-center justify-center text-[8px] font-bold text-[#2e4258]">
              10
            </button>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <img src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/7f9ee780-16bd-4f1b-8972-f8bed03c640b.png" alt="" className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <img src="https://pub-e9f6f8fe38ed4236ada6962783ff638d.r2.dev/actions/cdeb32ab-a319-44fd-93f2-b52a74d74673.png" alt="" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}