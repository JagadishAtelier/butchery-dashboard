import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { BellRing, PackageCheck, BarChart2, X, Truck, Check } from "lucide-react";

/**
 * NotificationModal
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - socketUrl (string)
 *  - role ("admin"|"pilot"|"user")
 *  - userId (string)
 *  - showToast (bool)
 *  - storageKey (string) optional, defaults to "app_notifications"
 *  - onNavigate (fn) optional, signature: (path: string, notification) => void
 */
export default function NotificationModal({
  open,
  onClose,
  socketUrl = "http://localhost:5000",
  role = "admin",
  userId = null,
  showToast = true,
  storageKey = "app_notifications",
  onNavigate = null,
}) {
  const modalRef = useRef();
  const socketRef = useRef(null);

  // initialize from localStorage so notifications persist across refresh
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (err) {
      console.error("Failed to read notifications from localStorage", err);
      return [];
    }
  });

  const persistNotifications = (arr) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch (err) {
      console.error("Failed to write notifications to localStorage", err);
    }
  };

  const pushNotification = (payload) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item = {
      id,
      createdAt: new Date().toISOString(),
      type: payload.type || "info",
      title: payload.title ?? "Notification",
      message: payload.message ?? "",
      meta: payload.meta ?? null,
    };

    setNotifications((prev) => {
      const newList = [item, ...prev].slice(0, 200);
      persistNotifications(newList);
      return newList;
    });

    if (showToast) {
      const short = `${item.title}: ${item.message}`;
      toast(short, { duration: 5000 });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // socket connection (mount only)
  useEffect(() => {
    const socket = io(socketUrl, { autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (role === "pilot") {
        socket.emit("joinPilots", userId);
      } else if (role === "admin") {
        socket.emit("joinAdmins");
      }
    });

    // --- events we listen for ---
    socket.on("newOrder", (data) => {
      pushNotification({
        type: "order",
        title: "New order",
        message: `Order ${data.orderId ?? data._id} placed — ₹${data.finalAmount ?? data.total ?? ""}`,
        meta: data,
      });
    });

    socket.on("ordersUpdate", (payload) => {
      if (Array.isArray(payload?.orders)) {
        pushNotification({
          type: "update",
          title: "Orders updated",
          message: `${payload.orders.length} unclaimed orders`,
          meta: payload,
        });
      }
    });

    socket.on("orderAssigned", ({ order }) => {
      pushNotification({
        type: "assigned",
        title: "Order assigned",
        message: `You were assigned order ${order.orderId ?? order._id}`,
        meta: order,
      });
    });

    socket.on("orderClaimed", (data) => {
      pushNotification({
        type: "claimed",
        title: "Order claimed",
        message: `Order ${data.orderId} was claimed`,
        meta: data,
      });
    });

    socket.on("orderReleased", () => {
      pushNotification({
        type: "released",
        title: "Order released",
        message: "Some previously-claimed orders are available again",
      });
    });

    socket.on("orderReached", (data) => {
      pushNotification({
        type: "status",
        title: "Reached pickup",
        message: `Order ${data.orderId} reached pickup point`,
        meta: data,
      });
    });

    socket.on("orderPickedUp", (data) => {
      pushNotification({
        type: "status",
        title: "Picked up",
        message: `Order ${data.orderId} picked up`,
        meta: data,
      });
    });

    socket.on("orderDelivered", (data) => {
      pushNotification({
        type: "status",
        title: "Delivered",
        message: `Order ${data.orderId} delivered`,
        meta: data,
      });
    });

    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl, role, userId, showToast]);

  // keep localStorage in sync if notifications change elsewhere (other tabs)
  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === storageKey) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(next)) setNotifications(next);
        } catch (err) {
          console.error("Failed to parse notifications from storage event", err);
        }
      }
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [storageKey]);

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error("Failed to remove notifications from localStorage", err);
    }
  };

  // navigation: use onNavigate if provided, else use window.location
  const handleClickNotification = (n) => {
    // order id fallback checks
    const orderId =  n.meta?._id ?? n.meta?.id ?? null;
    const orderUrl = n.meta?.orderUrl ?? null; // optional full URL from server
    let path = null;

    if (orderUrl) {
      path = orderUrl;
    } else if (orderId) {
      // prefer SPA-relative path like /orders/:id
      path = `/orders/${orderId}`;
    }

    if (!path) return; // nothing to navigate to

    if (typeof onNavigate === "function") {
      try {
        onNavigate(path, n);
      } catch (err) {
        console.warn("onNavigate threw an error, falling back to window.location", err);
        // fallback below
        const dest = /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path}`;
        window.location.href = dest;
      }
    } else {
      const dest = /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path}`;
      window.location.href = dest;
    }
  };

  // simple icon mapper
  const Icon = ({ t }) => {
    if (t === "order") return <PackageCheck className="w-4 h-4 text-green-500" />;
    if (t === "assigned") return <Truck className="w-4 h-4 text-orange-500" />;
    if (t === "claimed") return <Check className="w-4 h-4 text-red-500" />;
    if (t === "status") return <BarChart2 className="w-4 h-4 text-indigo-500" />;
    return <BellRing className="w-4 h-4 text-blue-500" />;
  };

  if (!open) return <><Toaster /></>;

  return (
    <>
      <Toaster />
      <div className="absolute right-0 sm:right-24 top-20 sm:top-24 z-50">
        <div
          ref={modalRef}
          className="bg-white w-96 rounded-lg shadow-xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={clearNotifications}
                className="text-xs px-2 py-1 bg-gray-100 rounded"
              >
                Clear
              </button>
              <button onClick={onClose}>
                <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
          </div>

          <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-3 text-gray-400">No notifications yet</li>
            )}

            {notifications.map((n) => (
              <li
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => handleClickNotification(n)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClickNotification(n); }}
                className="flex items-start p-3 gap-3 text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div className="mt-0.5">
                  <Icon t={n.type} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{n.message}</div>
                  {n.meta?.orderId && (
                    <div className="text-xs text-gray-400 mt-1">Order: {n.meta.orderId}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
