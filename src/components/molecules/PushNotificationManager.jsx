import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { Send, Bell, Loader2, RotateCcw, RefreshCcw } from "lucide-react"; // Added RefreshCcw for history

// We'll use a small Toast-like notification for better user feedback
// This would typically be a global component, but for this example,
// we'll keep it simple or assume a global toast system exists.
const NotificationToast = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 text-white z-50";
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
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white opacity-75 hover:opacity-100">&times;</button>
    </div>
  );
};


export default function PushNotificationManager() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false); // New state for history loading
  const [notificationToast, setNotificationToast] = useState({ message: "", type: "" });
  const [history, setHistory] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Debounced response message state for transient messages like form validation
  const [formResponseMsg, setFormResponseMsg] = useState("");
  useEffect(() => {
    if (formResponseMsg) {
      const timer = setTimeout(() => setFormResponseMsg(""), 3000); // Clear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [formResponseMsg]);


  const showToast = (message, type) => {
    setNotificationToast({ message, type });
  };

  const clearToast = () => {
    setNotificationToast({ message: "", type: "" });
  };

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true); // Set history loading state
    try {
      const res = await fetch(`${API_URL}/notifications/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
      showToast("Failed to load history.", "error");
    } finally {
      setHistoryLoading(false); // Clear history loading state
    }
  }, [API_URL]); // Dependency on API_URL

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // Dependency on fetchHistory useCallback

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setFormResponseMsg("⚠️ Please fill out both title and message"); // Use form specific message
      return;
    }

    setLoading(true);
    setFormResponseMsg(""); // Clear previous form messages
    clearToast(); // Clear any existing toasts

    try {
      const res = await fetch(`${API_URL}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Notification sent successfully!", "success");
        setTitle("");
        setBody("");
        fetchHistory(); // Refresh history
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
    // Show a confirmation modal/dialog for better UX than browser confirm
    if (!confirm(`Are you sure you want to resend "${item.title}"?`)) return;

    setLoading(true); // Indicate overall loading for the component
    clearToast();

    try {
      const res = await fetch(`${API_URL}/notifications/resend/${item._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Notification "${item.title}" resent!`, "success");
        fetchHistory(); // Refresh history
      } else {
        showToast(`Failed to resend: ${data.error || "Unknown error"}`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to resend notification. Network error?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="bg-white mx-auto rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <Bell className="w-7 h-7 text-indigo-500" /> {/* Changed color, slightly larger */}
          <h2 className="text-xl font-bold text-gray-800">
            Push Notification Manager
          </h2>
        </div>

        {/* Create Form */}
        <section className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100"> {/* Added section styling */}
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" /> Send New Notification
          </h3>
          <div className="mb-4">
            <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="notification-title"
              type="text"
              placeholder="e.g., New Product Launch! or Limited Time Offer!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              aria-label="Notification Title"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="notification-message"
              placeholder="e.g., Explore our latest collection and grab yours now! Don't miss out!"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4} // Set a fixed number of rows
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y" // Allow vertical resize
              aria-label="Notification Message"
            />
          </div>

          <button
            onClick={handleSendNotification}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-base"
            aria-label={loading ? "Sending notification" : "Send notification"}
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
            <p className="text-sm text-center text-red-600 mt-3 font-medium">
              {formResponseMsg}
            </p>
          )}
        </section>

        {/* History */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📜 Notification History
            </h3>
            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh history"
            >
              <RefreshCcw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
              {historyLoading ? 'Refreshing...' : 'Refresh'}
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
                      <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                      <td className="px-4 py-3 text-gray-600 line-clamp-2" title={item.body}>{item.body}</td> {/* line-clamp for long messages */}
                      <td className="px-4 py-3 text-center text-gray-500">
                        {new Date(item.sentAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleResend(item)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto px-2 py-1 rounded-md hover:bg-blue-50 transition"
                          disabled={loading} // Disable resend button if any action is loading
                          aria-label={`Resend notification: ${item.title}`}
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