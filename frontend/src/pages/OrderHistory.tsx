import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, type Order } from "../api/orders";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";

function OrderHistory() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.gmail) {
      return;
    }

    setIsLoading(true);
    setError("");

    getOrders(user.gmail)
      .then(setOrders)
      .catch(() => setError("Could not load order history."))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[80vh] px-5 py-16 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-black text-[#ce272a] sm:text-6xl">
            Order History
          </h1>

          {!user ? (
            <div className="mt-10 rounded-[28px] bg-[#ffbcbc] p-8 shadow-xl">
              <p className="text-2xl font-black text-[#790405]">
                Login to view your orders.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex rounded-full bg-[#2f9f9a] px-7 py-3 text-lg font-semibold text-white"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-6">
              {isLoading && (
                <p className="text-xl font-bold text-[#790405]">
                  Loading orders...
                </p>
              )}

              {error && <p className="text-xl font-bold text-[#ce272a]">{error}</p>}

              {!isLoading && !error && orders.length === 0 && (
                <div className="rounded-[28px] bg-[#ffbcbc] p-8 text-center shadow-xl">
                  <p className="text-2xl font-black text-[#ce272a]">
                    No orders yet.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex rounded-full bg-[#ce272a] px-8 py-4 text-lg font-semibold text-white"
                  >
                    Shop Magnets
                  </Link>
                </div>
              )}

              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[28px] bg-[#fffaf7] p-6 shadow-xl sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#790405]">
                        Order {order.id.slice(0, 8)}
                      </h2>
                      <p className="mt-1 text-base text-gray-700">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#2f9f9a] px-5 py-2 text-base font-bold text-white">
                      {order.status || "pending"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap justify-between gap-3 rounded-2xl bg-[#ffbcbc] px-5 py-4"
                      >
                        <span className="font-bold text-[#790405]">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-bold text-[#2f9f9a]">
                          Rs. {item.lineTotal}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#f0f0f0] p-5">
                    <h3 className="text-lg font-black text-[#790405]">
                      Tracking Status
                    </h3>
                    <div className="mt-4 space-y-3">
                      {[
                        { status: "pending", label: "Order Confirmed", icon: "✓" },
                        {
                          status: "confirmed",
                          label: "Payment Verified",
                          icon: "✓",
                        },
                        {
                          status: "processing",
                          label: "Processing",
                          icon: "⊙",
                        },
                        { status: "shipped", label: "Shipped", icon: "📦" },
                        {
                          status: "delivered",
                          label: "Delivered",
                          icon: "🎉",
                        },
                      ].map((step, index) => {
                        const statuses = [
                          "pending",
                          "confirmed",
                          "processing",
                          "shipped",
                          "delivered",
                        ];
                        const currentStatusIndex = statuses.indexOf(
                          order.status || "pending"
                        );
                        const stepIndex = index;
                        const isCompleted = stepIndex <= currentStatusIndex;
                        const isCurrent = stepIndex === currentStatusIndex;

                        return (
                          <div
                            key={step.status}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                                isCompleted
                                  ? "bg-[#2f9f9a] text-white"
                                  : "bg-[#e0e0e0] text-gray-400"
                              }`}
                            >
                              {step.icon}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm font-bold ${
                                  isCurrent
                                    ? "text-[#ce272a]"
                                    : isCompleted
                                      ? "text-[#2f9f9a]"
                                      : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-between gap-4 border-t border-[#ffb6b6] pt-5">
                    <p className="text-lg font-bold text-gray-700">
                      {order.delivery_address}
                    </p>
                    <p className="text-2xl font-black text-[#ce272a]">
                      Rs. {order.total_amount}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default OrderHistory;
