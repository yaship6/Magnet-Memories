import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { createOrder, type OrderResponse } from "../api/orders";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import paymentQr from "../../qr.jpeg";

const getPriceNumber = (price: string) => Number(price.replace(/[^0-9]/g, ""));

function Cart() {
  const { user, cartItems, clearCart, removeFromCart, updateQuantity } =
    useStore();
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] =
    useState<OrderResponse["order"] | null>(null);
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [confirmationEmailMessage, setConfirmationEmailMessage] = useState("");
  const total = cartItems.reduce(
    (sum, item) => sum + getPriceNumber(item.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || cartItems.length === 0 || isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);
    setOrderMessage("");
    setOrderError("");
    setPlacedOrder(null);
    setConfirmationEmailSent(false);
    setConfirmationEmailMessage("");

    try {
      const orderResponse = await createOrder({
        customer: { ...user, phone },
        deliveryAddress,
        notes,
        items: cartItems,
      });
      const { order, emailSent, emailMessage } = orderResponse;

      clearCart();
      setPhone("");
      setDeliveryAddress("");
      setNotes("");
      setPlacedOrder(order);
      setConfirmationEmailSent(emailSent);
      setConfirmationEmailMessage(emailMessage);
      setOrderMessage(
        `Order placed successfully. Order ID: ${order.id.slice(0, 8)}`
      );
      window.scrollTo(0, 0);
    } catch {
      setOrderError("Could not place order. Please check details and try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[80vh] px-5 py-16 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-5xl font-black text-[#ce272a] sm:text-6xl">
                Cart
              </h1>
              <p className="mt-4 text-xl text-gray-700">
                {user
                  ? `${user.name}'s saved cart`
                  : "Login to save cart items for your account."}
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full bg-[#ce272a] px-6 py-3 text-lg font-semibold text-white"
              >
                Clear Cart
              </button>
            )}
          </div>

          {!user && (
            <Link
              to="/login"
              className="mt-8 inline-flex rounded-full bg-[#2f9f9a] px-7 py-3 text-lg font-semibold text-white"
            >
              Login
            </Link>
          )}

          {cartItems.length === 0 && !placedOrder ? (
            <div className="mt-10 rounded-[32px] bg-[#ffbcbc] p-10 text-center shadow-xl">
              <p className="text-3xl font-black text-[#ce272a]">
                Your cart is empty.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex rounded-full bg-[#ce272a] px-8 py-4 text-lg font-semibold text-white"
              >
                Shop Magnets
              </Link>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="mt-10 grid gap-5">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-1 items-center gap-6 rounded-[28px] bg-[#ffbcbc] p-5 shadow-lg sm:grid-cols-[120px_1fr] lg:grid-cols-[120px_1fr_auto]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />

                  <div>
                    <h2 className="text-2xl font-black text-[#790405]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-lg text-gray-700">
                      {item.category}
                    </p>
                    <p className="mt-2 text-xl font-bold text-[#2f9f9a]">
                      {item.price}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#790405]"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center text-xl font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#790405]"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ce272a] text-white"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}

              <div className="rounded-[28px] bg-[#ca3a3c] p-8 text-right text-white shadow-xl">
                <p className="text-2xl font-black">Total: Rs. {total}</p>
              </div>

              <div className="grid gap-6 rounded-[28px] bg-[#fffaf7] p-6 shadow-xl sm:grid-cols-[1fr_180px] sm:p-8">
                <div>
                  <h2 className="text-3xl font-black text-[#ce272a]">
                    Payment
                  </h2>
                  <p className="mt-2 text-lg text-gray-700">
                    Scan the QR code or pay to UPI ID:
                  </p>
                  <p className="mt-3 break-all text-2xl font-black text-[#790405]">
                    yashihihi@ibl
                  </p>
                </div>
                <img
                  src={paymentQr}
                  alt="UPI payment QR code"
                  className="h-44 w-44 rounded-2xl border border-[#ffb6b6] bg-white object-contain p-3"
                />
              </div>

              {user ? (
                <form
                  onSubmit={handlePlaceOrder}
                  className="grid gap-5 rounded-[28px] bg-[#fffaf7] p-6 shadow-xl sm:p-8"
                >
                  <div>
                    <h2 className="text-3xl font-black text-[#ce272a]">
                      Place Order
                    </h2>
                    <p className="mt-2 text-lg text-gray-700">
                      Confirm your contact and delivery details.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                      Phone
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                        className="rounded-2xl border border-[#ffb6b6] bg-white px-5 py-4 text-[#1a1a1a] outline-none focus:border-[#ce272a]"
                      />
                    </label>

                    <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                      Name
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                    Delivery Address
                    <textarea
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      required
                      rows={3}
                      className="resize-none rounded-2xl border border-[#ffb6b6] bg-white px-5 py-4 text-[#1a1a1a] outline-none focus:border-[#ce272a]"
                    />
                  </label>

                  <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                    Order Notes
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      className="resize-none rounded-2xl border border-[#ffb6b6] bg-white px-5 py-4 text-[#1a1a1a] outline-none focus:border-[#ce272a]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-5 text-xl font-semibold text-white transition hover:scale-[1.02] hover:border-[#ff9999] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                  </button>

                  {orderMessage && (
                    <p className="text-lg font-bold text-[#2f9f9a]">
                      {orderMessage}
                    </p>
                  )}
                  {orderError && (
                    <p className="text-lg font-bold text-[#ce272a]">
                      {orderError}
                    </p>
                  )}
                </form>
              ) : (
                <div className="rounded-[28px] bg-[#fffaf7] p-8 shadow-xl">
                  <p className="text-xl font-bold text-[#790405]">
                    Login to place your order.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {placedOrder && (
            <section className="mt-10 rounded-[28px] bg-[#fffaf7] p-6 shadow-xl sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#ce272a]">
                    Order Summary
                  </h2>
                  <p className="mt-2 text-lg text-gray-700">
                    Order ID: {placedOrder.id}
                  </p>
                </div>
                <span className="rounded-full bg-[#2f9f9a] px-5 py-2 text-base font-bold text-white">
                  {placedOrder.status || "pending"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 text-lg text-gray-700">
                <p>
                  <span className="font-bold text-[#790405]">Name:</span>{" "}
                  {placedOrder.customer_name}
                </p>
                <p>
                  <span className="font-bold text-[#790405]">Gmail:</span>{" "}
                  {placedOrder.customer_gmail ?? placedOrder.customer_email}
                </p>
                <p>
                  <span className="font-bold text-[#790405]">Phone:</span>{" "}
                  {placedOrder.customer_phone}
                </p>
                <p>
                  <span className="font-bold text-[#790405]">Address:</span>{" "}
                  {placedOrder.delivery_address}
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {placedOrder.items.map((item) => (
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

              <div className="mt-6 grid gap-5 rounded-2xl bg-[#ffbcbc] p-5 sm:grid-cols-[1fr_160px]">
                <div>
                  <h3 className="text-2xl font-black text-[#790405]">
                    Payment
                  </h3>
                  <p className="mt-2 text-lg text-gray-700">
                    Pay to UPI ID:
                  </p>
                  <p className="mt-2 break-all text-2xl font-black text-[#ce272a]">
                    yashihihi@ibl
                  </p>
                </div>
                <img
                  src={paymentQr}
                  alt="UPI payment QR code"
                  className="h-40 w-40 rounded-2xl border border-[#ffb6b6] bg-white object-contain p-3"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#ffb6b6] pt-5">
                <p className="text-2xl font-black text-[#ce272a]">
                  Total: Rs. {placedOrder.total_amount}
                </p>
                <p className="text-base font-bold text-[#2f9f9a]">
                  {confirmationEmailMessage ||
                    (confirmationEmailSent
                      ? "Confirmation email sent."
                      : "Order saved. Confirmation email could not be sent.")}
                </p>
              </div>
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
