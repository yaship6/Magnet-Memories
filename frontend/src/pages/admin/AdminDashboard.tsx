import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminFeedback, getAdminOrders, updateOrderStatus, type Feedback } from "../../api/admin";
import type { Order } from "../../api/orders";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useStore } from "../../context/StoreContext";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "magnetmemories2210@gmail.com";

function AdminDashboard() {
  const { user } = useStore();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "feedback">("orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const isAdmin = user && (
    user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    user.gmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await getAdminOrders();
      setOrders(ordersData);
      
      const feedbackData = await getAdminFeedback();
      setFeedbacks(feedbackData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin && !loading) {
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const updated = await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-[#ffef3f]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            fill={star <= rating ? "currentColor" : "none"}
            stroke={star <= rating ? "#790405" : "currentColor"}
            strokeWidth={2}
          />
        ))}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-2xl border-2 border-[#790405] bg-white p-8 text-center shadow-xl">
            <AlertCircle className="mx-auto h-16 w-16 text-[#ca3a3c]" />
            <h1 className="mt-4 text-3xl font-black text-[#790405]">
              Access Denied
            </h1>
            <p className="mt-2 text-base text-gray-700">
              You must be logged in as an administrator to access the dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-full border-2 border-[#790405] bg-[#ca3a3c] py-3 font-semibold text-white transition duration-300 hover:bg-[#5a0205]"
              >
                Log In as Admin
              </button>
              <Link
                to="/"
                className="w-full rounded-full border-2 border-[#790405] bg-[#ffef3f] py-3 text-center font-black text-[#790405] shadow-[3px_3px_0px_#790405] hover:bg-[#ffb43b]"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate statistics based on canonical statuses
  const totalOrders = orders.length;
  let pendingCount = 0; // Order Confirmed
  let verifiedCount = 0; // Payment Verified
  let processingCount = 0; // Processing
  let shippedCount = 0; // Shipped
  let deliveredCount = 0; // Delivered
  let totalSales = 0;

  orders.forEach((o) => {
    const currentStatus = (o.status || "pending").toLowerCase().trim();
    const normalized =
      currentStatus.includes("deliv") ? "delivered" :
      currentStatus.includes("ship") ? "shipped" :
      currentStatus.includes("process") ? "processing" :
      (currentStatus.includes("confirm") || currentStatus.includes("verify") || currentStatus.includes("verified")) ? "confirmed" :
      "pending";

    if (normalized === "delivered") deliveredCount++;
    else if (normalized === "shipped") shippedCount++;
    else if (normalized === "processing") processingCount++;
    else if (normalized === "confirmed") verifiedCount++;
    else pendingCount++;

    if (normalized !== "pending") {
      totalSales += Number(o.total_amount || 0);
    }
  });

  // Calculate feedback statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    const currentStatus = (order.status || "pending").toLowerCase().trim();
    const normalizedStatus =
      currentStatus.includes("deliv") ? "delivered" :
      currentStatus.includes("ship") ? "shipped" :
      currentStatus.includes("process") ? "processing" :
      (currentStatus.includes("confirm") || currentStatus.includes("verify") || currentStatus.includes("verified")) ? "confirmed" :
      "pending";

    const matchesStatus =
      statusFilter === "all" || normalizedStatus === statusFilter;

    const term = searchQuery.toLowerCase().trim();
    if (!term) {
      return matchesStatus;
    }

    const matchesSearch =
      order.id.toLowerCase().includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_email?.toLowerCase().includes(term) ||
      order.customer_gmail?.toLowerCase().includes(term) ||
      order.customer_phone.toLowerCase().includes(term) ||
      order.delivery_address.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Filter and search feedbacks
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) {
      return true;
    }

    return (
      feedback.customer_name.toLowerCase().includes(term) ||
      feedback.feedback.toLowerCase().includes(term) ||
      feedback.order_id.toLowerCase().includes(term) ||
      feedback.rating.toString() === term ||
      (feedback.customer_email ?? feedback.customer_gmail ?? "").toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    const currentStatus = (status || "pending").toLowerCase().trim();
    if (currentStatus.includes("deliv")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-black text-[#059669]">
          🎉 Delivered
        </span>
      );
    }
    if (currentStatus.includes("ship")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e0e7ff] px-3 py-1 text-xs font-black text-[#4f46e5]">
          📦 Shipped
        </span>
      );
    }
    if (currentStatus.includes("process")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-black text-[#9333ea]">
          ⊙ Processing
        </span>
      );
    }
    if (currentStatus.includes("confirm") || currentStatus.includes("verify") || currentStatus.includes("verified")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-black text-[#2563eb]">
          ✓ Payment Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-black text-[#d97706]">
        ✓ Order Confirmed
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[100vh] px-4 py-8 sm:px-8 sm:py-10">
        <section className="mx-auto w-full max-w-[1200px]">
          {/* Header section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#790405] sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-700 sm:text-base">
                Track and manage orders, confirm payments, and read customer feedbacks.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#790405] bg-[#ffef3f] px-4 py-2 font-black text-[#790405] shadow-[3px_3px_0px_#790405] transition hover:-translate-y-0.5 hover:bg-[#ffb43b]"
            >
              Refresh Data
            </button>
          </div>

          {/* Main View Tabs */}
          <div className="mt-8 flex border-b-2 border-[#790405]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-6 py-3 font-black text-sm sm:text-base border-t-2 border-x-2 rounded-t-2xl -mb-[2px] transition ${
                activeTab === "orders"
                  ? "bg-white border-[#790405] text-[#790405] z-10"
                  : "bg-transparent border-transparent text-gray-500 hover:text-[#790405]"
              }`}
            >
              <Package size={18} />
              Manage Orders
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("feedback");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-6 py-3 font-black text-sm sm:text-base border-t-2 border-x-2 rounded-t-2xl -mb-[2px] transition ${
                activeTab === "feedback"
                  ? "bg-white border-[#790405] text-[#790405] z-10"
                  : "bg-transparent border-transparent text-gray-500 hover:text-[#790405]"
              }`}
            >
              <MessageSquare size={18} />
              Customer Feedback
            </button>
          </div>

          {/* Tab Conditional Rendering */}
          {activeTab === "orders" ? (
            <>
              {/* Stats Panel */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#790405]">
                    {totalOrders}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Confirmed
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#d97706]">
                    {pendingCount}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Verified
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#2563eb]">
                    {verifiedCount}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Processing
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#9333ea]">
                    {processingCount}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Shipped
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#4f46e5]">
                    {shippedCount}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Delivered
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#059669]">
                    {deliveredCount}
                  </p>
                </div>
                <div className="col-span-2 rounded-2xl border-2 border-[#790405] bg-[#fffaf7] p-4 shadow-md sm:col-span-4 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#2f9f9a]" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </p>
                  </div>
                  <p className="mt-1 text-2xl font-black text-[#2f9f9a]">
                    Rs. {totalSales}
                  </p>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Orders", value: "all" },
                    { label: "✓ Order Confirmed", value: "pending" },
                    { label: "✓ Payment Verified", value: "confirmed" },
                    { label: "⊙ Processing", value: "processing" },
                    { label: "📦 Shipped", value: "shipped" },
                    { label: "🎉 Delivered", value: "delivered" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        statusFilter === tab.value
                          ? "bg-[#ca3a3c] text-white"
                          : "bg-[#ffbcbc] text-[#790405] hover:bg-[#ca3a3c] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID, name, email, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-[#790405] bg-white py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2f9f9a]"
                  />
                </div>
              </div>

              {/* Loader or Error */}
              {loading ? (
                <div className="mt-12 flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ca3a3c]" />
                  <p className="mt-3 text-base font-semibold text-gray-600">
                    Fetching orders...
                  </p>
                </div>
              ) : error ? (
                <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center border border-red-200">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-2 text-lg font-bold text-red-700">Error</p>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="mt-8 rounded-2xl bg-white p-12 text-center border-2 border-dashed border-gray-300">
                  <Package className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-xl font-bold text-gray-500">
                    No Orders Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    No orders match your filter criteria or search query.
                  </p>
                </div>
              ) : (
                /* Orders List */
                <div className="mt-8 space-y-6">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-2xl border-2 border-[#790405] bg-white shadow-lg"
                    >
                      {/* Card Header */}
                      <div className="border-b border-gray-100 bg-[#fffaf7] px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-[#790405]">
                              Order ID: {order.id.slice(0, 8)}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Placed on: {new Date(order.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-[#2f9f9a]">
                            Rs. {order.total_amount}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Customer & Shipping Info */}
                        <div className="space-y-4">
                          <h4 className="text-base font-black text-[#790405] uppercase tracking-wide">
                            Customer Details
                          </h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p className="font-bold text-black">{order.customer_name}</p>
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <a
                                href={`mailto:${order.customer_email ?? order.customer_gmail}`}
                                className="hover:underline text-[#2f9f9a]"
                              >
                                {order.customer_email ?? order.customer_gmail}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="hover:underline"
                              >
                                {order.customer_phone}
                              </a>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="mt-0.5 text-gray-400" />
                              <span>{order.delivery_address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Items & Uploads */}
                        <div className="space-y-4 lg:col-span-2">
                          <h4 className="text-base font-black text-[#790405] uppercase tracking-wide">
                            Items Purchased
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div
                                key={`${item.id}-${index}`}
                                className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 border border-gray-100 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex gap-4">
                                  {/* Product Thumbnail */}
                                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 border">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-black">
                                      {item.name}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      Category: {item.category}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-gray-700">
                                      Qty: {item.quantity} × {item.price}
                                    </p>
                                  </div>
                                </div>

                                {/* Customer Uploaded Photo */}
                                <div className="flex flex-col gap-1.5 sm:items-end">
                                  <span className="text-xs font-bold text-gray-600">
                                    Custom Photos:
                                  </span>
                                  {item.customImages && item.customImages.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {item.customImages.map((customImg, imgIndex) => (
                                        <a
                                          key={imgIndex}
                                          href={customImg}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-white shadow-sm hover:border-[#2f9f9a]"
                                          title="Open original image"
                                        >
                                          <img
                                            src={customImg}
                                            alt={`custom-${imgIndex}`}
                                            className="h-full w-full object-cover transition group-hover:opacity-75"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                            <ExternalLink size={12} className="text-white opacity-0 transition group-hover:opacity-100" />
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs italic text-gray-400">
                                      No custom photo uploaded
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Status Actions and Notes */}
                      <div className="border-t border-gray-100 bg-[#fffaf7] px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Notes & Payment Info */}
                        <div className="max-w-xl text-xs text-gray-600">
                          {(() => {
                            const noteText = order.notes || "";
                            
                            // Extract Transaction ID and Screenshot URL using regex
                            const txRegex = /UPI Transaction ID:\s*([^\n\r]+)/i;
                            const screenshotRegex = /Payment Screenshot:\s*(https?:\/\/\S+)/i;
                            
                            const txMatch = noteText.match(txRegex);
                            const screenshotMatch = noteText.match(screenshotRegex);
                            
                            const txId = txMatch ? txMatch[1] : null;
                            const screenshotUrl = screenshotMatch ? screenshotMatch[1] : null;
                            
                            // Remove UTR and screenshot URL from clean notes to avoid duplicate display
                            const cleanNotes = noteText
                              .replace(txRegex, "")
                              .replace(screenshotRegex, "")
                              .replace(/Payment method: \w+/i, "")
                              .trim();

                            return (
                              <div className="space-y-2">
                                {cleanNotes && (
                                  <p>
                                    <strong className="text-gray-700">Notes:</strong>
                                    <span className="block mt-0.5 whitespace-pre-line bg-white/80 p-2 rounded-lg border border-gray-100 font-medium italic">
                                      {cleanNotes}
                                    </span>
                                  </p>
                                )}
                                
                                {txId && (
                                  <p className="mt-1">
                                    <strong className="text-gray-700">UPI Transaction UTR:</strong>{" "}
                                    <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-gray-100">{txId}</span>
                                  </p>
                                )}

                                {screenshotUrl && (
                                  <div className="mt-2">
                                    <strong className="text-gray-700 block mb-1">Payment Proof Screenshot:</strong>
                                    <a
                                      href={screenshotUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-white shadow-sm hover:border-[#2f9f9a]"
                                      title="Open original payment screenshot"
                                    >
                                      <img
                                        src={screenshotUrl}
                                        alt="Payment proof screenshot"
                                        className="h-full w-full object-cover transition group-hover:opacity-75"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                        <ExternalLink size={12} className="text-white opacity-0 transition group-hover:opacity-100" />
                                      </div>
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <p className="mt-2">
                            Payment Method: <span className="font-semibold">{order.payment_method === "razorpay" ? "Razorpay Card/UPI" : "Manual UPI Transfer"}</span>
                          </p>
                        </div>

                        {/* Status Management */}
                        <div className="flex items-center gap-3 flex-wrap justify-end sm:ml-auto">
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Change Status:
                          </span>
                          {(() => {
                            const currentStatusVal = (order.status || "pending").toLowerCase().trim();
                            const normalizedVal = 
                              currentStatusVal.includes("deliv") ? "delivered" :
                              currentStatusVal.includes("ship") ? "shipped" :
                              currentStatusVal.includes("process") ? "processing" :
                              (currentStatusVal.includes("confirm") || currentStatusVal.includes("verify") || currentStatusVal.includes("verified")) ? "confirmed" :
                              "pending";

                            return (
                              <select
                                value={normalizedVal}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="rounded-full border-2 border-[#790405] bg-[#fffaf7] px-4 py-1.5 text-sm font-black text-[#790405] shadow-[2px_2px_0px_#790405] focus:outline-none transition hover:bg-[#ffbcbc]"
                              >
                                <option value="pending">✓ Order Confirmed</option>
                                <option value="confirmed">✓ Payment Verified</option>
                                <option value="processing">⊙ Processing</option>
                                <option value="shipped">📦 Shipped</option>
                                <option value="delivered">🎉 Delivered</option>
                              </select>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Feedback Tab View */
            <>
              {/* Feedback Stats Panel */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border-2 border-[#790405] bg-white p-4 shadow-md">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Feedbacks
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#790405]">
                    {totalFeedbacks}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#790405] bg-[#fffaf7] p-4 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} fill="#ffef3f" stroke="#790405" strokeWidth={1.5} />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </p>
                  </div>
                  <p className="mt-1 text-2xl font-black text-[#2f9f9a]">
                    {averageRating} / 5.0
                  </p>
                </div>
              </div>

              {/* Feedback Search Bar */}
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold text-gray-700">
                  Showing {filteredFeedbacks.length} out of {totalFeedbacks} feedbacks
                </div>
                <div className="relative w-full max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search feedback by name, comments, order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-[#790405] bg-white py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2f9f9a]"
                  />
                </div>
              </div>

              {/* Feedbacks List */}
              {loading ? (
                <div className="mt-12 flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ca3a3c]" />
                  <p className="mt-3 text-base font-semibold text-gray-600">
                    Fetching feedback...
                  </p>
                </div>
              ) : error ? (
                <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center border border-red-200">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-2 text-lg font-bold text-red-700">Error</p>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="mt-8 rounded-2xl bg-white p-12 text-center border-2 border-dashed border-gray-300">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-xl font-bold text-gray-500">
                    No Feedbacks Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    No customer feedbacks match your search query.
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {filteredFeedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="rounded-2xl border-2 border-[#790405] bg-white p-6 shadow-lg transition hover:shadow-xl"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-lg font-black text-[#790405]">
                            {feedback.customer_name}
                          </h4>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                            <span>
                              Order ID: <span className="text-gray-700">{feedback.order_id.slice(0, 8)}</span>
                            </span>
                            { (feedback.customer_email ?? feedback.customer_gmail) && (
                              <span>
                                Email:{" "}
                                <a
                                  href={`mailto:${feedback.customer_email ?? feedback.customer_gmail}`}
                                  className="hover:underline text-[#2f9f9a]"
                                >
                                  {feedback.customer_email ?? feedback.customer_gmail}
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-1 sm:items-end">
                          {renderStars(feedback.rating)}
                          <span className="text-xs text-gray-400">
                            {new Date(feedback.created_at || Date.now()).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 whitespace-pre-line bg-[#fffaf7] p-4 rounded-xl border border-[#ffbcbc]/30 text-sm font-semibold italic text-gray-700">
                        "{feedback.feedback}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
