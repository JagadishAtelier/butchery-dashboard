import { useEffect, useState, useCallback } from "react";
import { Send, Bell, Loader2, RotateCcw, RefreshCcw, User, BellIcon } from "lucide-react";
import StatCard from "./StatCard";
// Simple Toast Notification Component
const NotificationToast = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 text-white z-50";
  let typeClasses = "";

  switch (type) {
    case "success":
      typeClasses = "bg-green-500";
      break;
    case "error":
      typeClasses = "bg-red-500";
      break;
    case "warning":
      typeClasses = "bg-yellow-500 text-gray-800";
      break;
    case "info":
      typeClasses = "bg-blue-500";
      break;
    default:
      typeClasses = "bg-gray-700";
  }

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white opacity-75 hover:opacity-100"
      >
        &times;
      </button>
    </div>
  );
};

export default function PushNotificationManager() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState({
    message: "",
    type: "",
  });
  const [history, setHistory] = useState([]);
  const [formResponseMsg, setFormResponseMsg] = useState("");
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    visitedViaPush: 0,
  });
  const [scheduleSunday, setScheduleSunday] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load stats", "error");
    }
  }, [API_URL]);

  // Fetch History
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
      showToast("Failed to load history.", "error");
    } finally {
      setHistoryLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  const showToast = (message, type) => setNotificationToast({ message, type });
  const clearToast = () => setNotificationToast({ message: "", type: "" });

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setFormResponseMsg("⚠️ Please fill out both title and message");
      return;
    }

    setLoading(true);
    clearToast();

    try {
      const res = await fetch(`${API_URL}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, scheduleSunday }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Notification sent successfully!", "success");
        setTitle("");
        setBody("");
        setScheduleSunday(false);
        fetchHistory();
        fetchStats();
      } else {
        showToast(`Failed to send: ${data.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Send error:", error);
      showToast("Failed to send notification. Network error?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (item) => {
    if (!confirm(`Are you sure you want to resend "${item.title}"?`)) return;

    setLoading(true);
    clearToast();

    try {
      const res = await fetch(`${API_URL}/notifications/resend/${item._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Notification "${item.title}" resent!`, "success");
        fetchHistory();
        fetchStats();
      } else {
        showToast(
          `Failed to resend: ${data.error || "Unknown error"}`,
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to resend notification. Network error?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-7 h-7 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Push Notification Manager
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          Create and manage push notifications for your users.
        </p>
      </div>

      {/* Stats */}
      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <StatCard
          label="Total Subscribers"
          value={stats.totalSubscribers}
          icon={<User />}
          color="bg-indigo-100"
        />
        <StatCard
          label="Visited via Push"
          value={stats.visitedViaPush}
          icon={<BellIcon />}
          color="bg-green-100"
        />
      </div>

      <div className="space-y-10">
        {/* Send Notification Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-indigo-500" /> Send New Notification
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g., New Product Launch! or Limited Time Offer!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                placeholder="e.g., Explore our latest collection and grab yours now!"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
              />
            </div>

            {/* Weekly Schedule */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={scheduleSunday}
                onChange={(e) => setScheduleSunday(e.target.checked)}
                className="rounded border-gray-300"
                id="scheduleSunday"
              />
              <label htmlFor="scheduleSunday" className="text-sm text-gray-700">
                Send every Sunday at 10:00 AM
              </label>
            </div>

            <button
              onClick={handleSendNotification}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Send Notification
                </>
              )}
            </button>

            {formResponseMsg && (
              <p className="text-sm text-center text-red-600 mt-2 font-medium">
                {formResponseMsg}
              </p>
            )}
          </div>
        </section>

        {/* Notification History */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📜 Notification History
            </h2>
            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw
                className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`}
              />
              {historyLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500 italic">
              <p>No notifications sent yet.</p>
              <p className="text-xs mt-1">Start by sending one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left w-1/4">Title</th>
                    <th className="px-4 py-3 text-left w-1/2">Message</th>
                    <th className="px-4 py-3 text-center w-1/6">Sent At</th>
                    <th className="px-4 py-3 text-center w-1/12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.title}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-600 line-clamp-2"
                        title={item.body}
                      >
                        {item.body}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {new Date(item.sentAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleResend(item)}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto px-2 py-1 rounded-md hover:bg-indigo-50 transition"
                          disabled={loading}
                        >
                          <RotateCcw className="w-4 h-4" /> Resend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <NotificationToast
        message={notificationToast.message}
        type={notificationToast.type}
        onClose={clearToast}
      />
    </div>
  );
}
