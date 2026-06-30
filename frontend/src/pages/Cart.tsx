import { Link } from "react-router-dom";
import { CreditCard, Minus, Plus, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createOrder,
  type OrderResponse,
} from "../api/orders";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import paymentQr from "../../qr.jpeg";

const getPriceNumber = (price: string) => Number(price.replace(/[^0-9]/g, ""));

function Cart() {
  const { user, cartItems, clearCart, removeFromCart, updateQuantity } =
    useStore();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
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
  const customerDisplayName = user?.name ?? user?.gmail ?? user?.email ?? "";

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || cartItems.length === 0 || isPlacingOrder) {
      return;
    }

    const cleanTx = transactionId.trim();
    const hasTxId = cleanTx.length > 0;
    const isValidTx = /^\d{12}$/.test(cleanTx);

    if (hasTxId && !isValidTx) {
      setOrderError("UPI Transaction ID must be exactly 12 digits.");
      return;
    }

    if (!hasTxId && !screenshot) {
      setOrderError("Please enter a 12-digit UTR/Transaction ID OR upload a Payment Screenshot.");
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
        customer: { ...user, name: customerDisplayName, phone },
        deliveryAddress,
        notes,
        items: cartItems,
        payment: {
          method: "manual_upi",
          transactionId: cleanTx || undefined,
          screenshot: screenshot || undefined,
        } as any,
      });
      const { order, emailSent, emailMessage } = orderResponse;

      clearCart();
      setPhone("");
      setDeliveryAddress("");
      setNotes("");
      setTransactionId("");
      setScreenshot(null);
      setScreenshotName("");
      setPlacedOrder(order);
      setConfirmationEmailSent(emailSent);
      setConfirmationEmailMessage(emailMessage);
      setOrderMessage(`Order placed successfully! Order ID: ${order.id.slice(0, 8)}`);
      window.scrollTo(0, 0);
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Could not place order. Please check details and try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[80vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#ce272a] sm:text-6xl">
                Cart
              </h1>
              <p className="mt-3 text-base text-gray-700 sm:mt-4 sm:text-xl">
                {user
                  ? `${customerDisplayName}'s saved cart`
                  : "Login to save cart items for your account."}
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="w-full rounded-full bg-[#ce272a] px-6 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg"
              >
                Clear Cart
              </button>
            )}
          </div>

          {!user && (
            <Link
              to="/login"
              className="mt-8 inline-flex w-full justify-center rounded-full bg-[#2f9f9a] px-7 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg"
            >
              Login
            </Link>
          )}

          {cartItems.length === 0 && !placedOrder ? (
            <div className="mt-10 rounded-[28px] bg-[#ffbcbc] p-6 text-center shadow-xl sm:rounded-[32px] sm:p-10">
              <p className="text-2xl font-black text-[#ce272a] sm:text-3xl">
                Your cart is empty.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#ce272a] px-8 py-4 text-base font-semibold text-white sm:w-auto sm:text-lg"
              >
                Shop Magnets
              </Link>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="mt-10 grid gap-5">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-[24px] bg-[#ffbcbc] p-4 shadow-lg sm:grid-cols-[120px_1fr] sm:gap-6 sm:rounded-[28px] sm:p-5 lg:grid-cols-[120px_1fr_auto]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[88px] w-[88px] rounded-2xl object-cover sm:h-28 sm:w-28"
                  />

                  <div className="min-w-0">
                    <h2 className="text-xl font-black leading-tight text-[#790405] sm:text-2xl">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-700 sm:text-lg">
                      {item.category}
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#2f9f9a] sm:text-xl">
                      {item.price}
                    </p>
                  </div>

                  <div className="col-span-2 flex flex-wrap items-center justify-end gap-3 sm:col-span-2 lg:col-span-1">
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

              <div className="rounded-[24px] bg-[#ca3a3c] p-5 text-right text-white shadow-xl sm:rounded-[28px] sm:p-8">
                <p className="text-xl font-black sm:text-2xl">Total: Rs. {total}</p>
              </div>

              {/* Payment Verification Section */}
              <div className="grid gap-6 rounded-[24px] bg-[#fffaf7] p-5 shadow-xl sm:rounded-[28px] sm:p-8">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <CreditCard className="text-[#2f9f9a]" size={30} />
                    <h2 className="text-2xl font-black text-[#ce272a] sm:text-3xl">
                      Payment Verification
                    </h2>
                  </div>
                  
                  <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                    <img
                      src={paymentQr}
                      alt="UPI payment QR code"
                      className="mx-auto h-44 w-44 rounded-2xl border border-[#ffb6b6] bg-white object-contain p-3 sm:mx-0"
                    />
                    <div>
                      <p className="text-base text-gray-700 sm:text-lg">
                        Please pay <span className="font-black text-[#ce272a]">Rs. {total}</span> using any UPI app by scanning the QR code or sending directly to the UPI address below.
                      </p>
                      <p className="mt-3 break-all text-2xl font-black text-[#790405]">
                        yashihihi@ibl
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#ffb6b6]/30 pt-6 grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                      <div className="flex flex-wrap justify-between items-baseline">
                        <span>12-Digit Transaction ID (UTR) <span className="text-[#ce272a]">*</span></span>
                        <span className="text-xs font-normal text-gray-500">(Required if no screenshot)</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter 12-digit UTR"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        className="rounded-2xl border border-[#ffb6b6] bg-white px-5 py-4 text-[#1a1a1a] outline-none focus:border-[#ce272a]"
                      />
                    </label>

                    <label className="grid gap-2 text-lg font-semibold text-[#790405]">
                      <div className="flex flex-wrap justify-between items-baseline">
                        <span>Upload Payment Screenshot <span className="text-[#ce272a]">*</span></span>
                        <span className="text-xs font-normal text-gray-500">(Required if no UTR)</span>
                      </div>
                      <div className="relative flex items-center justify-center rounded-2xl border-2 border-dashed border-[#ffb6b6] bg-white px-5 py-4 text-center cursor-pointer hover:border-[#ce272a]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-500 truncate px-2">
                          {screenshotName ? `✓ ${screenshotName}` : "Click to select screenshot"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {user ? (
                <form
                  onSubmit={handlePlaceOrder}
                  className="grid gap-5 rounded-[24px] bg-[#fffaf7] p-5 shadow-xl sm:rounded-[28px] sm:p-8"
                >
                  <div>
                    <h2 className="text-2xl font-black text-[#ce272a] sm:text-3xl">
                      Place Order
                    </h2>
                    <p className="mt-2 text-base text-gray-700 sm:text-lg">
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
                        value={customerDisplayName}
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
                    className="rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-[1.02] hover:border-[#ff9999] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:py-5 sm:text-xl"
                  >
                    {isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
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
                <div className="rounded-[24px] bg-[#fffaf7] p-5 shadow-xl sm:rounded-[28px] sm:p-8">
                  <p className="text-xl font-bold text-[#790405]">
                    Login to place your order.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {placedOrder && (
            <section className="mt-10 rounded-[24px] bg-[#fffaf7] p-5 shadow-xl sm:rounded-[28px] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
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

              <div className="mt-6 grid gap-5 rounded-2xl bg-[#ffbcbc] p-5">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-[#790405]">
                    Payment Status
                  </h3>
                  <p className="mt-2 text-lg text-gray-700">
                    Your UPI payment verification is pending manual review by the admin.
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-base font-black text-[#d97706]">
                    <Clock size={18} />
                    Pending Verification
                  </p>
                </div>
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
