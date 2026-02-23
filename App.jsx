import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis
} from "recharts";
import {
  DndContext,
  closestCorners,
  useDroppable,
  useDraggable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import API from "./api/axios";


/* ================= MAIN APP ================= */

function App() {
  const [active, setActive] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [reports, setReports] = useState([]);
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    memberId: ""
  });

  const [loginName, setLoginName] = useState("");
  const [loginMemberId, setLoginMemberId] = useState("");

  const [todos, setTodos] = useState([]);
  const [showTodoModal, setShowTodoModal] = useState(false);

  const [todoForm, setTodoForm] = useState({
    title: "",
    note: "",
    status: "Pending"
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    work: "",
    members: []
  });

const [analytics, setAnalytics] = useState({
    pending: 0,
    progress: 0,
    completed: 0,
    overdue: 0
  });




  const [form, setForm] = useState({
    title: "",
    priority: "Low",
    dueDate: "",
    assignedUser: "",
    team: "",
    fileName: "",
    fileData: ""
  });


  const addNotification = async (message, targetRole = "all") => {
    try {
      const res = await API.post("/notifications", {
        message,
        targetRole,
        read: false
      });

      setNotifications(prev => [res.data, ...prev]);

      // 🔊 Sound
      const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-7.mp3");
      audio.play().catch(() => { });
    } catch (err) {
      console.log("Notification error:", err.response?.data || err.message);
    }
  };

  const sendMessage = async (toUser, content) => {
    if (!content.trim()) return;

    try {
      const sender = role === "admin"
        ? "Admin"
        : currentUser.name;

      // 1️⃣ Save message
      const res = await API.post("/messages", {
        from: sender,
        to: toUser,
        content
      });

      setMessages(prev => [...prev, res.data]);

      // 2️⃣ Save notification in backend
      await API.post("/notifications", {
        message: `New message from ${sender}`,
        targetRole: "all"
      });

      // 3️⃣ Refresh notifications
      const notifRes = await API.get("/notifications");
      setNotifications(notifRes.data);

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };




  useEffect(() => {
    tasks
      .filter(t => t && t._id)
      .forEach(task => {
        if (
          task.dueDate &&
          task.status !== "Completed" &&
          new Date(task.dueDate) < new Date()
        ) {
          addNotification(
            `Task "${task.title}" is overdue`,
            "admin"
          );
        }
      });
  }, [tasks]);


  const createTodo = async () => {
    if (!todoForm.title.trim()) return;

    try {
      const res = await API.post("/todos", {
        title: todoForm.title,
        note: todoForm.note,
        status: todoForm.status,
        owner: role === "admin" ? "admin" : currentUser.name
      });

      setTodos(prev => [...prev, res.data]);

      setTodoForm({
        title: "",
        note: "",
        status: "Pending"
      });

      setShowTodoModal(false);
      showMessage("Todo Created");

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };



  const updateTodoStatus = async (id, status) => {
    try {
      const res = await API.put(`/todos/${id}`, { status });

      setTodos(prev =>
        prev.map(t => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.log(err);
    }
  };


  const deleteTodo = async (id) => {
    try {
      await API.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };


  const editTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    const newTitle = prompt("Edit todo", todo.title);
    if (!newTitle) return;

    try {
      const res = await API.put(`/todos/${id}`, {
        title: newTitle
      });

      setTodos(prev =>
        prev.map(t =>
          t._id === id ? res.data : t
        )
      );

      showMessage("Todo Updated");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= PERSISTENCE ================= */

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTasks();
  }, []);

  const showMessage = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await API.get("/todos");
        setTodos(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await API.get("/teams");
        setTeams(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = role === "admin" ? "Admin" : currentUser?.name;

        if (!user) return;

        const res = await API.get(`/messages?user=${user}`);
        setMessages(res.data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();
  }, [role, currentUser]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        setReports(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/analytics/overview");
        setAnalytics(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAnalytics();
  }, []);


  /* ================= LOGIN ================= */

  if (!role) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <button
            onClick={() => {
              const pass = prompt("Enter Admin Password");
              if (pass === "1234") setRole("admin");
              else alert("Wrong password");
            }}
            className="w-full bg-blue-600 text-white py-2 rounded mb-4"
          >
            Login as Admin
          </button>
          <div className="space-y-3 mt-4">

            <input
              placeholder="Enter Name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="Enter Unique Member ID"
              value={loginMemberId}
              onChange={(e) => setLoginMemberId(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button
              onClick={() => {
                const user = users.find(
                  u => u.name === loginName && u.memberId === loginMemberId
                );

                if (user) {
                  setRole("member");
                  setCurrentUser(user);
                  setActive("tasks");
                } else {
                  alert("Invalid credentials");
                }
              }}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Login as Member
            </button>

          </div>



        </div>
      </div>
    );
  }

  /* ================= HELPERS ================= */
  const filteredTodos =
    role === "admin"
      ? todos.filter(t => t.owner === "admin")
      : todos.filter(t => t.owner === currentUser?.name);

  const safeTasks = tasks.filter(t => t && t._id);

  const filteredTasks =
    role === "admin"
      ? safeTasks
      : safeTasks.filter(t => t.assignedUser === currentUser?.name);

  const pending = safeTasks.filter(t => t.status === "Pending").length;

  const progress = safeTasks.filter(t => t.status === "In Progress").length;

  const completed = safeTasks.filter(t => t.status === "Completed").length;

  const overdue = safeTasks.filter(t => {
    if (!t.dueDate) return false;
    if (t.status === "Completed") return false;
    return new Date(t.dueDate) < new Date();
  }).length;


  /* ================= TASK FUNCTIONS ================= */

  const createTask = async () => {
    if (!form.title.trim()) return;

    try {
      const res = await API.post("/tasks", form);
      setTasks(prev => [...prev, res.data]);

      setForm({
        title: "",
        priority: "Low",
        dueDate: "",
        assignedUser: "",
        team: "",
        fileName: "",
        fileData: ""
      });

      setShowModal(false);
      showMessage("Task Created");

    } catch (err) {
      console.log(err);
    }
  };


  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status });

      if (!res.data || !res.data._id) return;

      setTasks(prev =>
        prev
          .map(t => (t && t._id === id ? res.data : t))
          .filter(t => t && t._id)
      );

      showMessage("Status Updated");

    } catch (err) {
      console.log("Update error:", err.response?.data || err.message);
    }
  };


  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);

      setTasks(prev =>
        prev.filter(t => t._id !== id)
      );

      showMessage("Task Deleted");

    } catch (err) {
      console.log("Delete error:", err.response?.data || err.message);
    }
  };





  /* ================= RENDER ================= */

  return (
    <div className="flex h-screen bg-gray-100">

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-xl p-6">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/logox.png"
            alt="Logo"
            className="h-8 w-auto"
          />
        </div>


        {(role === "admin"
          ? ["dashboard", "tasks", "todos", "kanban", "users", "teams", "reports", "analytics", "notifications", "messages"]
          : ["tasks", "todos", "messages"]

        ).map(item => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`block w-full text-left px-4 py-2 mb-2 rounded capitalize flex justify-between ${active === item ? "bg-blue-600 text-white" : "hover:bg-gray-200"
              }`}
          >
            <span>{item}</span>

            {item === "notifications" &&
              notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
          </button>

        ))}

        <button
          onClick={() => {
            setRole(null);
            setCurrentUser(null);
          }}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        {active === "notifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Notifications</h2>
              <button
                onClick={async () => {
                  await API.delete("/notifications");
                  setNotifications([]);
                }}

                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Clear All
              </button>
            </div>

            {notifications.length === 0 && (
              <p className="text-gray-500">No notifications</p>
            )}

            {notifications.map(n => (
              <div
                key={n._id}
                className={`p-4 rounded shadow ${n.read ? "bg-white" : "bg-blue-50 border-l-4 border-blue-600"
                  }`}
                onClick={async () => {
                  await API.put(`/notifications/${n._id}`);
                  setNotifications(prev =>
                    prev.map(item =>
                      item._id === n._id ? { ...item, read: true } : item
                    )
                  );
                }}
              >
                <p className="font-medium">{n.message}</p>
                <p className="text-sm text-gray-500">{n.date}</p>
              </div>
            ))}
          </div>
        )}
        {active === "messages" && (
          <MessagesPage
            role={role}
            currentUser={currentUser}
            users={users}
            messages={messages}
            sendMessage={sendMessage}
          />
        )}

        {showMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-96 space-y-4">

              <h2 className="text-xl font-bold">Add Member</h2>

              <input
                placeholder="Full Name"
                value={memberForm.name}
                onChange={e =>
                  setMemberForm({ ...memberForm, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Phone Number (with country code)"
                value={memberForm.phone}
                onChange={e =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Unique Member ID"
                value={memberForm.memberId}
                onChange={e =>
                  setMemberForm({ ...memberForm, memberId: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!memberForm.name || !memberForm.phone || !memberForm.memberId) {
                      alert("All fields required");
                      return;
                    }

                    try {
                      const res = await API.post("/users", memberForm);

                      setUsers(prev => [...prev, res.data]);

                      setMemberForm({
                        name: "",
                        phone: "",
                        memberId: ""
                      });

                      setShowMemberModal(false);
                      showMessage("User Added Successfully");

                    } catch (error) {
                      console.log(error.response?.data);
                      alert(error.response?.data?.error || "Error adding user");
                    }
                  }}

                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}

        {active === "todos" && (
          <div className="space-y-4">

            {filteredTodos.map(todo => (

              <div key={todo._id} className="bg-white p-4 rounded shadow">

                <h3 className="font-semibold">{todo.title}</h3>
                <p>Status: <b>{todo.status}</b></p>
                {todo.note && <p className="text-sm text-gray-500">Note: {todo.note}</p>}

                <div className="flex flex-wrap gap-2 mt-3">

                  <button
                    onClick={() => updateTodoStatus(todo._id, "Done")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Done
                  </button>

                  <button
                    onClick={() => updateTodoStatus(todo._id, "Not Done")}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Not Done
                  </button>

                  <button
                    onClick={() => {
                      const note = prompt("Add note");
                      if (!note) return;
                      setTodos(prev =>
                        prev.map(t =>
                          t._id === todo._id ? { ...t, note } : t
                        )
                      );
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Add Note
                  </button>

                  <button
                    onClick={() => editTodo(todo._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

            <div className="flex flex-wrap gap-3 mb-6">

              <button
                onClick={() => setShowTodoModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
              >
                + Add Todo
              </button>

              <button
                onClick={() => {
                  const headers = "Todo,Status\n";
                  const rows = filteredTodos
                    .map(t => `${t.title},${t.status}`)
                    .join("\n");

                  const link = document.createElement("a");
                  link.href = encodeURI(
                    "data:text/csv;charset=utf-8," + headers + rows
                  );
                  link.download = "todo_report.csv";
                  link.click();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Export Excel
              </button>

              <button
                onClick={() => {
                  const text = filteredTodos
                    .map(t => `• ${t.title} - ${t.status}`)
                    .join("%0A");

                  window.open(
                    `https://wa.me/?text=Todo List%0A${text}`
                  );
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Share on WhatsApp
              </button>

              <button
                onClick={async () => {
                  const today = new Date().toLocaleDateString();

                  const reportData = {
                    id: Date.now(),
                    user: role === "admin" ? "Admin" : currentUser.name,
                    date: today,
                    tasks: filteredTodos.map(
                      t => `${t.title} - ${t.status}${t.note ? ` | Note: ${t.note}` : ""}`
                    ),
                    type: "todo"
                  };

                  try {
                    const res = await API.post("/reports", reportData);
                    setReports(prev => [res.data, ...prev]);
                    alert("Todo Report Submitted");
                  } catch (err) {
                    console.log(err);
                  }


                  alert("Todo Report Submitted");
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Submit Report
              </button>

            </div>



          </div>
        )}

        {/* DASHBOARD */}
        {active === "dashboard" && role === "admin" && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard title="Pending" value={analytics.pending} />
              <StatCard title="In Progress" value={analytics.progress} />
              <StatCard title="Completed" value={analytics.completed} />
              <StatCard title="Overdue" value={analytics.overdue} />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <ChartBox>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Pending", value: pending },
                        { name: "Progress", value: progress },
                        { name: "Completed", value: completed }
                      ]}
                      dataKey="value"
                      outerRadius={100}
                    >
                      <Cell fill="#505050" />
                      <Cell fill="#0072b4" />
                      <Cell fill="#3aad49" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>

              <ChartBox>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tasks.map(t => ({ name: t.title, val: 1 }))}>
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="val" fill="#0072b4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
          </>
        )}

        {/* USERS */}
        {active === "users" && role === "admin" && (
          <div>

            <button
              onClick={() => setShowMemberModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
              + Add Member
            </button>

            {users.length === 0 && (
              <p className="text-gray-500">No members added yet</p>
            )}

            {users.map(user => (
              <div key={user._id} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">Member ID: {user.memberId}</p>
                  <p className="text-sm text-gray-500">Phone: {user.phone}</p>
                </div>

                <button
                  onClick={async () => {
                    await API.delete(`/users/${user._id}`);
                    setUsers(prev => prev.filter(u => u._id !== user._id));
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}

          </div>
        )}


        {/* TEAMS */}
        {active === "teams" && role === "admin" && (
          <div className="space-y-4">

            {/* OPEN MODAL BUTTON */}
            <button
              onClick={() => setShowTeamModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Create Team
            </button>


            {teams.length === 0 && (
              <p className="text-gray-500">No teams created yet</p>
            )}

            {teams.map(team => (
              <div key={team._id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <p className="text-sm text-gray-500">Work: {team.work}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {team.members?.map((m, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    await API.delete(`/teams/${team._id}`);
                    setTeams(prev =>
                      prev.filter(t => t._id !== team._id)
                    );
                  }}
                  className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}



        {/* TASKS */}
        {active === "tasks" && (
          <div className="space-y-4">
            {role === "member" && (
              <div className="mb-4 bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">My Teams</h3>

                <div className="flex flex-wrap gap-2">
                  {teams
                    .filter(team => team.members.includes(currentUser.name))
                    .map(team => (
                      <span
                        key={team._id}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {team.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {filteredTasks
              .filter(t => t && t._id)
              .map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  role={role}
                  updateStatus={updateStatus}
                  deleteTask={deleteTask}
                  setTasks={setTasks}
                  showMessage={showMessage}
                  users={users}
                />
              ))}

            {role === "admin" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                + Create Task
              </button>
            )}

            {role === "member" && (
              <MemberButtons
                filteredTasks={filteredTasks}
                currentUser={currentUser}
                setReports={setReports}
                addNotification={addNotification}
              />
            )}
          </div>
        )}

        {/* REPORTS */}
        {active === "reports" && role === "admin" && (
          <div className="space-y-6">

            {Object.entries(
              reports.reduce((acc, report) => {
                if (!acc[report.date]) acc[report.date] = [];
                acc[report.date].push(report);
                return acc;
              }, {})
            ).map(([date, dailyReports]) => (

              <details key={date} className="bg-white rounded shadow p-4">
                <summary className="font-bold text-lg cursor-pointer">
                  📅 {date}
                </summary>

                <div className="mt-4 space-y-4">
                  {dailyReports.map(r => (
                    <div key={r._id} className="border p-3 rounded">

                      <h3 className="font-semibold">
                        {r.user} ({r.type === "task" ? "Task Report" : "Todo Report"})
                      </h3>

                      {r.tasks.map((t, i) => (
                        <p key={i} className="text-sm">• {t}</p>
                      ))}

                    </div>
                  ))}
                </div>

              </details>
            ))}

          </div>
        )}


        {/* ANALYTICS */}
        {active === "analytics" && role === "admin" && (
          <div className="space-y-4">
            {users.map(user => {
              const userTasks = tasks.filter(t => t.assignedUser === user.name);
              const done = userTasks.filter(t => t.status === "Completed").length;
              const rate = userTasks.length
                ? Math.round((done / userTasks.length) * 100)
                : 0;

              return (
                <div key={user._id} className="bg-white p-4 rounded shadow">
                  <h3>{user.name}</h3>
                  <p>Total: {userTasks.length} | Done: {done}</p>
                  <div className="w-full bg-gray-200 h-3 rounded mt-2">
                    <div
                      className="bg-green-600 h-3 rounded"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* KANBAN */}
        {active === "kanban" && role === "admin" && (
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={async (event) => {
              const { active, over } = event;
              if (!over) return;

              try {
                const res = await API.put(`/tasks/${active.id}/status`, {
                  status: over.id
                });

                setTasks(prev =>
                  prev.map(t =>
                    t._id === active.id ? { ...res.data } : t
                  )
                );

              } catch (err) {
                console.log(err);
              }
            }}

          >
            <div className="grid grid-cols-3 gap-6">
              {["Pending", "In Progress", "Completed"].map(status => (
                <KanbanColumn
                  key={status}
                  id={status}
                  tasks={safeTasks.filter(t => t.status === status)}
                />
              ))}
            </div>
          </DndContext>
        )}

      </div>

      {/* MODAL */}
      {
        showModal && (
          <TaskModal
            form={form}
            setForm={setForm}
            users={users}
            teams={teams}
            createTask={createTask}
            setShowModal={setShowModal}
          />

        )
      }

      {
        showTodoModal && (
          <TodoModal
            todoForm={todoForm}
            setTodoForm={setTodoForm}
            createTodo={createTodo}
            setShowTodoModal={setShowTodoModal}
          />
        )
      }

      {
        showTeamModal && (
          <TeamModal
            teamForm={teamForm}
            setTeamForm={setTeamForm}
            users={users}
            setTeams={setTeams}
            setShowTeamModal={setShowTeamModal}
          />
        )
      }

    </div >

  );

}




/* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3>{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ChartBox({ children }) {
  return (
    <div className="bg-white p-6 rounded shadow">{children}</div>
  );
}

function Management({ title, items, setItems }) {
  return (
    <div>
      <button
        onClick={() => {
          const name = prompt(`Enter ${title} name`);
          if (!name) return;

          let phone = "";

          if (title === "User") {
            phone = prompt("Enter phone number with country code (e.g. 919876543210)");
            if (!phone) return;
          }

          setItems(prev => [
            ...prev,
            { id: Date.now(), name, phone }
          ]);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        + Add {title}
      </button>


      {items.map(item => (
        <div key={item._id} className="bg-white p-3 rounded shadow mb-2 flex justify-between">
          {item.name}
          <button
            onClick={() =>
              setItems(prev => prev.filter(i => i._id !== item._id))
            }
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  role,
  updateStatus,
  deleteTask,
  setTasks,
  showMessage,
  users,
}) {
  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    task.status !== "Completed" &&
    new Date(task.dueDate) < new Date();

  return (
    <div className={`p-5 rounded shadow ${isOverdue ? "bg-red-50 border-l-4 border-red-600" : "bg-white"
      }`}>
      <h3 className="font-semibold text-lg">{task.title}</h3>

      <p className="text-sm text-gray-500">
        Priority: {task.priority}
      </p>

      {task.team && (
        <p className="text-sm text-gray-500">
          Team: <b>{task.team}</b>
        </p>
      )}

      {task.assignedUser && (
        <p className="text-sm text-gray-500">
          Assigned To: <b>{task.assignedUser}</b>
        </p>
      )}

      {task.fileData && (
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = task.fileData;
            link.download = task.fileName || "file";
            link.click();
          }}
          className="text-blue-600 underline text-sm mt-2"
        >
          📎 Download: {task.fileName}
        </button>
      )}



      <p className="text-sm mt-1">
        Status: <b>{task.status}</b>
        {isOverdue && (
          <span className="inline-block mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            OVERDUE
          </span>
        )}

      </p>

      {task.note && (
        <p className="text-sm text-red-500 mt-2">
          Note: {task.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => updateStatus(task._id, "Completed")}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm">
          Done
        </button>

        <button onClick={() => updateStatus(task._id, "In Progress")}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Progress
        </button>

        {role === "admin" && task.assignedUser && (
          <button
            onClick={() => {
              const user = users.find(u => u.name === task.assignedUser);

              if (!user || !user.phone) {
                alert("No phone number found for this user");
                return;
              }

              // Clean phone number (remove spaces, +, etc.)
              const cleanPhone = user.phone.replace(/\D/g, "");

              const message = `New Task Assigned:
Task: ${task.title}
Priority: ${task.priority}
Due: ${task.dueDate || "No due date"}`;

              const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
          >
            WhatsApp
          </button>

        )}

        <button
          onClick={async () => {
            const note = prompt("Why not done?");
            if (!note) return;

            try {
              const res = await API.put(`/tasks/${task._id}`, {
                status: "Pending",
                note
              });

              setTasks(prev =>
                prev.map(t =>
                  t._id === task._id ? res.data : t
                )
              );

              showMessage("Marked Not Done");

            } catch (err) {
              console.log(err);
            }
          }}
          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
        >
          Not Done
        </button>

        <button
          onClick={async () => {
            const note = prompt("Add note");
            if (!note) return;

            try {
              const res = await API.put(`/tasks/${task._id}`, {
                note
              });

              setTasks(prev =>
                prev.map(t =>
                  t._id === task._id ? res.data : t
                )
              );

              showMessage("Note Added");

            } catch (err) {
              console.log(err);
            }
          }}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
        >
          Add Note
        </button>

        {role === "admin" && (
          <button
            onClick={() => deleteTask(task._id


            )}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function MemberButtons({ filteredTasks, currentUser, setReports, addNotification }) {
  return (
    <div className="mt-6 flex gap-3 flex-wrap">
      <button
        onClick={async () => {
          const today = new Date().toLocaleDateString();

          const reportTasks = filteredTasks.map(
            t => `${t.title} - ${t.status}${t.note ? ` | Note: ${t.note}` : ""}`
          );


          try {
            const res = await API.post("/reports", {
              user: currentUser.name,
              date: today,
              type: "task",
              tasks: reportTasks
            });

            setReports(prev => [res.data, ...prev]);

            addNotification(
              `${currentUser.name} submitted daily report`,
              "admin"
            );

            alert("Report Submitted");

          } catch (err) {
            console.log(err.response?.data || err.message);
            alert("Error submitting report");
          }
          addNotification(
            `${currentUser.name} submitted daily report`,
            "admin"
          );


          alert("Report Submitted");

          // 🔔 WhatsApp to Admin
          const adminPhone = prompt("Enter Admin WhatsApp number with country code");

          if (adminPhone) {
            const message = `Daily Report from ${currentUser.name}:
${reportTasks.join("\n")}`;

            window.open(
              `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`
            );
          }
        }}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit Daily Report
      </button>


      <button
        onClick={() => {
          const text = filteredTasks
            .map(t => `• ${t.title} - ${t.status}`)
            .join("%0A");

          window.open(
            `https://wa.me/?text=Daily Report%0A${text}`
          );
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded"
      >
        Send WhatsApp Report
      </button>

      <button
        onClick={() => {
          const headers = "Task,Status\n";
          const rows = filteredTasks
            .map(t => `${t.title},${t.status}`)
            .join("\n");

          const link = document.createElement("a");
          link.href = encodeURI(
            "data:text/csv;charset=utf-8," + headers + rows
          );
          link.download = "daily_report.csv";
          link.click();
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Export Excel
      </button>
    </div>
  );
}

function KanbanColumn({ id, tasks }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-white p-4 rounded shadow min-h-[300px]">
      <h3 className="font-semibold mb-4">{id}</h3>
      {tasks.map(task => (
        <KanbanItem key={task._id} task={task} />
      ))}
    </div>
  );
}

function KanbanItem({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({ id: task._id.toString() });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded mb-2 cursor-grab ${task.dueDate &&
        task.status !== "Completed" &&
        new Date(task.dueDate) < new Date()
        ? "bg-red-100 border border-red-500"
        : "bg-gray-100"
        }`}
    >
      {task.title}
    </div>
  );
}

function TaskModal({
  form,
  setForm,
  users,
  teams,
  createTask,
  setShowModal
}) {

  const availableMembers = form.team
    ? teams.find(t => t.name === form.team)?.members || []
    : users.map(u => u.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-[400px] space-y-3">

        <input
          placeholder="Task Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <select
          value={form.priority}
          onChange={e =>
            setForm({ ...form, priority: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <input
          type="date"
          value={form.dueDate}
          onChange={e =>
            setForm({ ...form, dueDate: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* TEAM SELECT */}
        <select
          value={form.team || ""}
          onChange={e =>
            setForm({
              ...form,
              team: e.target.value,
              assignedUser: ""
            })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Select Team (Optional)</option>
          {teams.map(team => (
            <option key={team._id}>{team.name}</option>
          ))}
        </select>

        {/* MEMBER SELECT */}
        <select
          value={form.assignedUser}
          onChange={e =>
            setForm({ ...form, assignedUser: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Select Member</option>

          {availableMembers.map((member, index) => (
            <option key={index}>{member}</option>
          ))}
        </select>

        {/* FILE UPLOAD */}
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              setForm({
                ...form,
                fileName: file.name,
                fileData: reader.result
              });
            };
            reader.readAsDataURL(file);
          }}
          className="w-full border p-2 rounded"
        />


        <button
          onClick={createTask}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Create Task
        </button>

        <button
          onClick={() => setShowModal(false)}
          className="w-full border py-2 rounded"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}
function TeamModal({ teamForm, setTeamForm, users, setTeams, setShowTeamModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-[400px] space-y-3">

        <h2 className="text-xl font-bold">Create Team</h2>

        <input
          placeholder="Team Name"
          value={teamForm.name}
          onChange={(e) =>
            setTeamForm(prev => ({
              ...prev,
              name: e.target.value
            }))
          }
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Work / Description"
          value={teamForm.work}
          onChange={(e) =>
            setTeamForm(prev => ({
              ...prev,
              work: e.target.value
            }))
          }
          className="w-full border p-2 rounded"
        />


        <div>
          <p className="text-sm mb-2">Select Members</p>

          <div className="max-h-32 overflow-y-auto border rounded p-2">
            {users.map(user => (
              <label key={user._id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={teamForm.members.includes(user.name)}
                  onChange={() => {
                    setTeamForm(prev => {
                      const exists = prev.members.includes(user.name);

                      return {
                        ...prev,
                        members: exists
                          ? prev.members.filter(m => m !== user.name)
                          : [...prev.members, user.name]
                      };
                    });
                  }}
                />
                {user.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTeamModal(false)}
            className="flex-1 border py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (!teamForm.name.trim()) {
                alert("Team name required");
                return;
              }

              try {
                const res = await API.post("/teams", teamForm);

                setTeams(prev => [...prev, res.data]);

                setTeamForm({
                  name: "",
                  work: "",
                  members: []
                });

                setShowTeamModal(false);

                alert("Team Created Successfully");

              } catch (err) {
                console.log(err.response?.data || err.message);
                alert("Error creating team");
              }
            }}
          >
            Create
          </button>

        </div>

      </div>
    </div>
  );
}


function TodoModal({ todoForm, setTodoForm, createTodo, setShowTodoModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 space-y-3">

        <input
          placeholder="Todo Title"
          value={todoForm.title}
          onChange={e => setTodoForm({ ...todoForm, title: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Note (optional)"
          value={todoForm.note}
          onChange={e => setTodoForm({ ...todoForm, note: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={createTodo}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Create Todo
        </button>

        <button
          onClick={() => setShowTodoModal(false)}
          className="w-full border py-2 rounded"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}

function MessagesPage({
  role,
  currentUser,
  users,
  messages,
  sendMessage
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [text, setText] = useState("");

  const me = role === "admin" ? "Admin" : currentUser.name;

  const visibleMessages =
    role === "admin"
      ? messages
      : messages.filter(
        m => m.to === me || m.from === me
      );


  return (
    <div className="grid grid-cols-3 gap-6">

      {/* Conversation List */}
      <div className="bg-white p-4 rounded shadow col-span-2">
        <h3 className="font-bold mb-4">Inbox</h3>

        {visibleMessages.length === 0 && (
          <p className="text-gray-500">No messages yet</p>
        )}

        {visibleMessages.map(msg => (
          <div
            key={msg._id}
            className={`mb-3 p-3 rounded ${msg.from === me
              ? "bg-blue-100 text-right"
              : "bg-gray-100"
              }`}
          >
            <p className="text-sm font-semibold">
              {msg.from} → {msg.to}
            </p>
            <p>{msg.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {msg.date}
            </p>
          </div>
        ))}
      </div>

      {/* Send Message */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-4">Send Message</h3>

        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="">Select User</option>

          {role === "admin" && (
            <>
              {users.map(u => (
                <option key={u._id}>{u.name}</option>
              ))}
            </>
          )}

          {role === "member" && (
            <>
              <option>Admin</option>

              {users
                .filter(u => u.name !== currentUser.name)
                .map(u => (
                  <option key={u._id}>{u.name}</option>
                ))}
            </>
          )}
        </select>


        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type message..."
          className="w-full border p-2 rounded mb-3"
        />

        <button
          onClick={() => {
            if (!selectedUser) return;
            sendMessage(selectedUser, text);
            setText("");
          }}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default App;
