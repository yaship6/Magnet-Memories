import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { getOrders, getOrdersStreamUrl, type Order } from "../api/orders";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";

function OrderHistory() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);

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

  useEffect(() => {
    if (!user?.gmail) {
      setIsLive(false);
      return;
    }

    const orderStream = new EventSource(getOrdersStreamUrl(user.gmail));

    orderStream.addEventListener("open", () => {
      setIsLive(true);
    });

    orderStream.addEventListener("orders", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          orders?: Order[];
        };

        if (Array.isArray(payload.orders)) {
          setOrders(payload.orders);
          setError("");
        }
      } catch {
        setError("Could not read live order updates.");
      }
    });

    orderStream.addEventListener("error", () => {
      setIsLive(false);
    });

    return () => {
      setIsLive(false);
      orderStream.close();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[80vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto w-full max-w-[1200px]">
          <h1 className="text-4xl font-black text-[#ce272a] sm:text-6xl">
            Order History
          </h1>
          {user && (
            <p className="mt-3 inline-flex rounded-full bg-[#2f9f9a] px-4 py-2 text-sm font-bold text-white">
              {isLive ? "Live tracking on" : "Connecting live tracking..."}
            </p>
          )}

          {!user ? (
            <div className="mt-10 rounded-[24px] bg-[#ffbcbc] p-5 shadow-xl sm:rounded-[28px] sm:p-8">
              <p className="text-xl font-black text-[#790405] sm:text-2xl">
                Login to view your orders.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#2f9f9a] px-7 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg"
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
                <div className="rounded-[24px] bg-[#ffbcbc] p-5 text-center shadow-xl sm:rounded-[28px] sm:p-8">
                  <p className="text-xl font-black text-[#ce272a] sm:text-2xl">
                    No orders yet.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex w-full justify-center rounded-full bg-[#ce272a] px-8 py-4 text-base font-semibold text-white sm:w-auto sm:text-lg"
                  >
                    Shop Magnets
                  </Link>
                </div>
              )}

              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[24px] bg-[#fffaf7] p-5 shadow-xl sm:rounded-[28px] sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-[#790405] sm:text-2xl">
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

                  <div className="mt-5 grid gap-4 border-t border-[#ffb6b6] pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                    <p className="text-base font-bold text-gray-700 sm:text-lg">
                      {order.delivery_address}
                    </p>
                    <div className="grid gap-3 sm:justify-items-end">
                      <p className="text-xl font-black text-[#ce272a] sm:text-2xl">
                        Rs. {order.total_amount}
                      </p>
                      <Link
                        to={`/order-feedback?orderId=${encodeURIComponent(
                          order.id
                        )}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ce272a] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#5a0205]"
                      >
                        <MessageSquareText size={18} />
                        Rate & Review
                      </Link>
                    </div>
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
