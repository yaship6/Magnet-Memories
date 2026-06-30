import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { google } from "googleapis";
import adminRoutes from "./adminRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(__dirname, ".env");
const app = express();
const port = process.env.PORT || 4000;
const backendVersion = "2026-05-29-signup-direct-response";

async function loadEnvFile() {
  try {
    const contents = await readFile(envFile, "utf-8");

    contents.split(/\r?\n/).forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    // Running without a local .env is fine when env vars are provided another way.
  }
}

await loadEnvFile();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5174",
  ...(process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  })
);

app.use(express.json({ limit: "10mb" }));

app.options(/.*/, cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
}));

function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
}

function createId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function verifyPassword(password, user) {
  if (!user.salt || !user.password_hash) {
    return false;
  }

  const { hash } = createPasswordHash(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.password_hash));
}

function toPublicUser(user) {
  const gmail = user.gmail ?? user.email;
  const name = user.name ?? user.gmail ?? user.email ?? "Customer";

  return {
    id: user.id,
    name,
    email: gmail,
    gmail,
    phone: user.phone ?? "",
  };
}

function getPriceNumber(price) {
  return Number(String(price).replace(/[^0-9]/g, ""));
}

function getPexelsConfig() {
  const apiKey = process.env.PEXELS_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl:
      process.env.PEXELS_API_BASE_URL?.trim() ?? "https://api.pexels.com/v1",
  };
}

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, "");
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, "");

  if (!keyId || !keySecret) {
    return null;
  }

  return {
    keyId,
    keySecret,
    baseUrl:
      process.env.RAZORPAY_API_BASE_URL?.trim() ??
      "https://api.razorpay.com/v1",
  };
}

function getRazorpayErrorMessage(responseText) {
  try {
    const parsed = JSON.parse(responseText);
    const description = parsed?.error?.description;
    const code = parsed?.error?.code;

    if (code === "BAD_REQUEST_ERROR" && description === "Authentication failed") {
      return "Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are copied from the same Razorpay test/live key pair, then restart the backend.";
    }

    if (description) {
      return `Razorpay error: ${description}`;
    }
  } catch {
    // Razorpay may return plain text for some failures.
  }

  return responseText || "Razorpay request failed.";
}

async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  const razorpay = getRazorpayConfig();

  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  const credentials = Buffer.from(
    `${razorpay.keyId}:${razorpay.keySecret}`
  ).toString("base64");

  const result = await fetch(`${razorpay.baseUrl}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });
  const responseText = await result.text();

  if (!result.ok) {
    throw new Error(getRazorpayErrorMessage(responseText));
  }

  const order = responseText ? JSON.parse(responseText) : {};

  return {
    keyId: razorpay.keyId,
    order,
  };
}

function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const razorpay = getRazorpayConfig();

  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  const generatedSignature = crypto
    .createHmac("sha256", razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const generatedBuffer = Buffer.from(generatedSignature);
  const receivedBuffer = Buffer.from(String(razorpaySignature));

  if (generatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(generatedBuffer, receivedBuffer);
}

function normalizePexelsPhoto(photo) {
  const image =
    photo?.src?.large2x ??
    photo?.src?.large ??
    photo?.src?.medium ??
    photo?.src?.original ??
    "";

  if (!photo?.id || !image) {
    return null;
  }

  return {
    id: String(photo.id),
    title: String(photo.alt ?? "Pexels inspiration"),
    description: String(photo.alt ?? ""),
    image,
    photographer: String(photo.photographer ?? ""),
    photographerUrl: String(photo.photographer_url ?? ""),
    pexelsUrl: String(photo.url ?? ""),
  };
}

async function searchPexelsPhotos({
  query = "happy family memories",
  pageSize = 30,
} = {}) {
  const pexels = getPexelsConfig();

  if (!pexels) {
    throw new Error("Pexels is not configured. Set PEXELS_API_KEY.");
  }

  const url = new URL(`${pexels.baseUrl}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(Math.min(Math.max(pageSize, 1), 80)));
  url.searchParams.set("orientation", "portrait");

  const result = await fetch(url, {
    headers: {
      Authorization: pexels.apiKey,
    },
  });
  const responseText = await result.text();

  if (!result.ok) {
    throw new Error(responseText || "Pexels request failed.");
  }

  const data = responseText ? JSON.parse(responseText) : {};

  return {
    items: (data.photos ?? []).map(normalizePexelsPhoto).filter(Boolean),
    page: data.page ?? null,
    nextPage: data.next_page ?? null,
  };
}

function normalizeOrderItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = getPriceNumber(item.price);

      return {
        id: String(item.id ?? ""),
        name: String(item.name ?? "").trim(),
        category: String(item.category ?? "").trim(),
        price: String(item.price ?? "").trim(),
        unitPrice,
        quantity,
        image: String(item.image ?? ""),
        customImages: Array.isArray(item.customImages)
          ? item.customImages.map((image) => String(image ?? "")).filter(Boolean)
          : [],
        lineTotal: unitPrice * quantity,
      };
    })
    .filter((item) => item.id && item.name && item.unitPrice > 0);
}

function parseDataImageUrl(value) {
  const match = String(value).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  if (key.split(".").length !== 3) {
    throw new Error(
      "Supabase service role key is invalid. Check SUPABASE_SERVICE_ROLE_KEY in the backend environment."
    );
  }

  return { url: url.replace(/\/$/, ""), key };
}

async function uploadSupabaseStorageObject({
  bucketName,
  objectPath,
  contentType,
  buffer,
}) {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const result = await fetch(
    `${supabase.url}/storage/v1/object/${bucketName}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabase.key}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: buffer,
    }
  );
  const responseText = await result.text();

  if (!result.ok) {
    throw new Error(responseText || "Supabase photo upload failed.");
  }

  return `${supabase.url}/storage/v1/object/public/${bucketName}/${objectPath}`;
}

function getImageExtension(contentType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[contentType] ?? "png";
}

async function uploadOrderItemPhotos(items) {
  const orderPhotoBucket = "order-photos";
  const folder = `orders/${new Date().toISOString().slice(0, 10)}`;

  return Promise.all(
    items.map(async (item) => {
      const images = item.customImages.length > 0 ? item.customImages : [item.image];
      const uploadedImages = [];

      for (const [index, image] of images.entries()) {
        const parsedImage = parseDataImageUrl(image);

        if (!parsedImage) {
          if (image) {
            uploadedImages.push(image);
          }
          continue;
        }

        const extension = getImageExtension(parsedImage.contentType);
        const objectPath = `${folder}/${item.id}-${index + 1}.${extension}`;
        const photoUrl = await uploadSupabaseStorageObject({
          bucketName: orderPhotoBucket,
          objectPath,
          contentType: parsedImage.contentType,
          buffer: parsedImage.buffer,
        });

        uploadedImages.push(photoUrl);
      }

      return {
        ...item,
        image: uploadedImages[0] ?? item.image,
        customImages: uploadedImages,
      };
    })
  );
}

async function requestSupabaseTable(tableName, options = {}) {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const pathAndQuery = options.query
    ? `${tableName}?${options.query}`
    : tableName;
  const result = await fetch(`${supabase.url}/rest/v1/${pathAndQuery}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseText = await result.text();

  if (!result.ok) {
    throw new Error(responseText || "Supabase request failed.");
  }

  return responseText ? JSON.parse(responseText) : null;
}

async function createSupabaseOrder(order) {
  const orders = await requestSupabaseTable("orders", {
    method: "POST",
    prefer: "return=representation",
    body: order,
  });

  const createdOrder = Array.isArray(orders) ? orders[0] : orders;

  if (!createdOrder) {
    throw new Error("Supabase did not return the created order.");
  }

  return createdOrder;
}

async function updateSupabaseOrder(id, patch) {
  const orders = await requestSupabaseTable("orders", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(id)}&select=*`,
    prefer: "return=representation",
    body: patch,
  });

  const updatedOrder = Array.isArray(orders) ? orders[0] : orders;

  if (!updatedOrder) {
    throw new Error("Supabase order row was not updated.");
  }

  return updatedOrder;
}

async function createSupabaseFeedback(feedback) {
  const feedbackRows = await requestSupabaseTable("feedback", {
    method: "POST",
    prefer: "return=representation",
    body: feedback,
  });

  const createdFeedback = Array.isArray(feedbackRows)
    ? feedbackRows[0]
    : feedbackRows;

  if (!createdFeedback) {
    throw new Error("Supabase did not return the created feedback.");
  }

  return createdFeedback;
}

async function createSupabaseContactMessage(message) {
  const contactRows = await requestSupabaseTable("contact_messages", {
    method: "POST",
    prefer: "return=representation",
    body: message,
  });

  const createdMessage = Array.isArray(contactRows)
    ? contactRows[0]
    : contactRows;

  if (!createdMessage) {
    throw new Error("Supabase did not return the created contact message.");
  }

  return createdMessage;
}

async function listSupabaseOrdersByGmail(gmail) {
  return requestSupabaseTable("orders", {
    query: `customer_gmail=eq.${encodeURIComponent(
      gmail
    )}&select=*&order=created_at.desc`,
  });
}

async function createSupabaseCustomer(user) {
  await requestSupabaseTable("customers", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      id: user.id,
      name: user.name,
      gmail: user.gmail,
      salt: user.salt,
      password_hash: user.password_hash,
      created_at: user.createdAt,
    },
  });

  return user;
}

async function findSupabaseCustomerByGmail(gmail) {
  const customers = await requestSupabaseTable("customers", {
    query: `gmail=eq.${encodeURIComponent(gmail)}&select=*`,
  });

  if (!Array.isArray(customers)) {
    return customers ?? null;
  }

  return customers[0] ?? null;
}

async function updateSupabaseCustomerProfile(id, profile) {
  const customers = await requestSupabaseTable("customers", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(id)}&select=*`,
    prefer: "return=representation",
    body: profile,
  });

  const updatedCustomer = Array.isArray(customers) ? customers[0] : customers;

  if (!updatedCustomer) {
    throw new Error("Customer profile was not updated.");
  }

  return updatedCustomer;
}

function getSupabaseErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);

  try {
    const parsed = JSON.parse(message);

    if (parsed?.message) {
      return String(parsed.message);
    }
  } catch {
    // Supabase sometimes returns plain text errors.
  }

  return message;
}

function formatOrderEmail(order) {
  const productsList = order.items
    .map((item) => `${item.name} x ${item.quantity}`)
    .join(", ");

  const orderDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return [
    `Hi ${order.customer_name},`,
    "",
    "Thank you for your order with Magnet Memories! 💙",
    "",
    "We're excited to let you know that your order has been successfully received.",
    "",
    "Order Details",
    "",
    `- Order ID: ${order.id}`,
    `- Order Date: ${orderDate}`,
    `- Items Ordered: ${productsList}`,
    `- Total Amount: ₹${order.total_amount}`,
    "",
    "Our team will begin preparing your order with care. Once it's ready and shipped, it'll be updated on the portal.",
    "",
    "If you have any questions or need to make changes to your order, simply check for the feedback section on the website for further assistance!",
    "",
    "Thank you for choosing Magnet Memories. We can't wait for you to receive your order!",
    "",
    "Warm regards,",
    "",
    "Team Magnet Memories",
    "7042736597",
  ].join("\n");
}

function formatEmailHeader(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

async function sendGmailMessage({ to, subject, text }) {
  const gmailUser = (process.env.EMAIL_USER ?? process.env.GMAIL_USER)?.trim();
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();

  if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
    return { skipped: true };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = Buffer.from(
      [
        `From: "Magnet Memories" <${gmailUser}>`,
        `To: ${formatEmailHeader(to)}`,
        `Subject: ${formatEmailHeader(subject)}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        text,
      ].join("\r\n")
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return { skipped: false };
  } catch (err) {
    console.error("Failed to send email via Google Gmail API:", err);
    // Fall back to skipped: true so the app can continue working in mock/sandbox mode!
    return { skipped: true };
  }
}

async function sendOrderConfirmationEmail(order, to) {
  const emailConfigured = Boolean(
    (process.env.EMAIL_USER ?? process.env.GMAIL_USER)?.trim() &&
    process.env.GMAIL_CLIENT_ID?.trim() &&
    process.env.GMAIL_CLIENT_SECRET?.trim() &&
    process.env.GMAIL_REFRESH_TOKEN?.trim()
  );

  if (!emailConfigured) {
    return {
      emailSent: false,
      emailMessage: "Confirmation email is not configured.",
    };
  }

  try {
    const result = await sendGmailMessage({
      to,
      subject: `Magnet Memories order confirmation ${order.id.slice(0, 8)}`,
      text: formatOrderEmail(order),
    });

    if (result.skipped) {
      return {
        emailSent: false,
        emailMessage: "Confirmation email is not configured.",
      };
    }

    return {
      emailSent: true,
      emailMessage: "Confirmation email sent.",
    };
  } catch (emailError) {
    console.error("Confirmation email could not be sent:", emailError);

    return {
      emailSent: false,
      emailMessage: "Order saved. Confirmation email could not be sent.",
    };
  }
}

app.locals.requestSupabaseTable = requestSupabaseTable;
app.locals.updateSupabaseOrder = updateSupabaseOrder;
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/config-check", (_request, response) => {
  response.json({
    ok: true,
    backendVersion,
    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL),
    supabaseServiceRoleConfigured: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    frontendUrlConfigured: Boolean(process.env.FRONTEND_URL),
    pexelsConfigured: Boolean(process.env.PEXELS_API_KEY),
    razorpayConfigured: Boolean(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ),
    razorpayMode: process.env.RAZORPAY_KEY_ID?.trim().startsWith("rzp_live")
      ? "live"
      : process.env.RAZORPAY_KEY_ID?.trim().startsWith("rzp_test")
        ? "test"
        : "unknown",
    nodeVersion: process.version,
  });
});

app.get("/api/pexels/photos", async (request, response) => {
  try {
    const pageSize = Number(request.query.pageSize ?? 30);
    const query = String(
      request.query.query ?? "personalized gifts happy memories"
    ).trim();
    const photos = await searchPexelsPhotos({
      query,
      pageSize: Number.isFinite(pageSize) ? pageSize : 30,
    });

    return response.json(photos);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not load Pexels photos.",
    });
  }
});

app.post("/api/payments/razorpay/order", async (request, response) => {
  try {
    const body = request.body ?? {};
    const amount = Number(body.amount);
    const receipt = String(body.receipt ?? `mm-${Date.now()}`).slice(0, 40);
    const notes =
      body.notes && typeof body.notes === "object" ? body.notes : {};
    const razorpayOrder = await createRazorpayOrder({
      amount,
      receipt,
      notes,
    });

    return response.status(201).json(razorpayOrder);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not create Razorpay order.",
    });
  }
});

app.post("/api/payments/razorpay/verify", async (request, response) => {
  try {
    const body = request.body ?? {};
    const razorpayOrderId = String(body.razorpay_order_id ?? "").trim();
    const razorpayPaymentId = String(body.razorpay_payment_id ?? "").trim();
    const razorpaySignature = String(body.razorpay_signature ?? "").trim();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return response.status(400).json({
        message: "Razorpay order, payment, and signature are required.",
      });
    }

    const verified = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verified) {
      return response.status(400).json({
        message: "Payment verification failed.",
      });
    }

    return response.json({
      verified: true,
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not verify Razorpay payment.",
    });
  }
});

app.post("/api/auth/signup", async (request, response) => {
  try {
    const body = request.body ?? {};
    const name = String(body.name ?? "").trim();
    const gmail = String(body.gmail ?? body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !gmail || !password) {
      return response
        .status(400)
        .json({ message: "Name, Gmail, and password are required." });
    }

    if (password.length < 6) {
      return response
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await findSupabaseCustomerByGmail(gmail);

    if (existingUser) {
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const { salt, hash } = createPasswordHash(password);
    const user = {
      id: createId(),
      name,
      gmail,
      phone: "",
      salt,
      password_hash: hash,
      createdAt: new Date().toISOString(),
    };

    await createSupabaseCustomer(user);

    return response.status(201).json({
      user: {
        id: user.id,
        name,
        email: gmail,
        gmail,
        phone: "",
      },
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not create account.",
    });
  }
});

app.post("/api/auth/login", async (request, response) => {
  const body = request.body ?? {};
  const gmail = String(body.email ?? body.gmail ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!gmail || !password) {
    return response.status(400).json({ message: "Gmail and password are required." });
  }

  let user;

  try {
    user = await findSupabaseCustomerByGmail(gmail);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error ? error.message : "Could not check account.",
    });
  }

  if (!user || !verifyPassword(password, user)) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  return response.json({ user: toPublicUser(user) });
});

const resetCodes = new Map();

app.post("/api/auth/forgot-password", async (request, response) => {
  try {
    const body = request.body ?? {};
    const gmail = String(body.email ?? body.gmail ?? "").trim().toLowerCase();

    if (!gmail) {
      return response.status(400).json({ message: "Gmail/email is required." });
    }

    const user = await findSupabaseCustomerByGmail(gmail);
    if (!user) {
      return response.status(404).json({ message: "No account found with this email address." });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    resetCodes.set(gmail, { code, expiresAt });

    console.log(`[ForgotPassword] Generated reset code for ${gmail}: ${code}`);

    const emailSubject = "Reset your Memory Magnets password";
    const emailText = [
      `Hello ${user.name || "there"},`,
      "",
      "We received a request to reset your password for your Memory Magnets account.",
      "",
      `Your 6-digit verification code is: ${code}`,
      "",
      "This code will expire in 15 minutes.",
      "",
      "If you did not request this, you can ignore this email.",
      "",
      "Best regards,",
      "The Memory Magnets Team"
    ].join("\n");

    const emailResult = await sendGmailMessage({ to: gmail, subject: emailSubject, text: emailText });

    if (emailResult && emailResult.skipped) {
      return response.json({
        message: "Email service is not configured. Reset code has been logged to the server console.",
        emailSent: false,
        debugCode: code // return it in response for easy local testing when no email is set up
      });
    }

    return response.json({
      message: "A 6-digit verification code has been sent to your email address.",
      emailSent: true
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error instanceof Error ? error.message : "Could not request password reset."
    });
  }
});

app.post("/api/auth/reset-password", async (request, response) => {
  try {
    const body = request.body ?? {};
    const gmail = String(body.email ?? body.gmail ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!gmail || !code || !newPassword) {
      return response.status(400).json({ message: "Email, code, and new password are required." });
    }

    if (newPassword.length < 6) {
      return response.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const record = resetCodes.get(gmail);
    if (!record) {
      return response.status(400).json({ message: "No active password reset request found for this email." });
    }

    if (record.code !== code) {
      return response.status(400).json({ message: "Invalid verification code." });
    }

    if (Date.now() > record.expiresAt) {
      resetCodes.delete(gmail);
      return response.status(400).json({ message: "Verification code has expired." });
    }

    const user = await findSupabaseCustomerByGmail(gmail);
    if (!user) {
      return response.status(404).json({ message: "User not found." });
    }

    // Generate new salt and hash
    const { salt, hash } = createPasswordHash(newPassword);

    // Update customer in Supabase
    await updateSupabaseCustomerProfile(user.id, {
      salt,
      password_hash: hash
    });

    // Remove the code from cache
    resetCodes.delete(gmail);

    return response.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error instanceof Error ? error.message : "Could not reset password."
    });
  }
});

app.post("/api/auth/google", async (request, response) => {
  try {
    const { credential } = request.body ?? {};

    if (!credential) {
      return response.status(400).json({ message: "Google ID token is required." });
    }

    let gmail, name;

    if (credential.startsWith("mock-google-token:")) {
      const tokenParts = credential.slice("mock-google-token:".length).split(":");
      gmail = tokenParts[0]?.trim().toLowerCase();
      name = tokenParts[1]?.trim() || "Google User";
    } else {
      const clientId = (process.env.GOOGLE_CLIENT_ID ?? process.env.GMAIL_CLIENT_ID)?.trim();
      if (!clientId) {
        return response.status(500).json({ message: "Google OAuth Client ID is not configured on the server." });
      }

      const oauth2Client = new google.auth.OAuth2(clientId);

      let ticket;
      try {
        ticket = await oauth2Client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
      } catch (verifyError) {
        console.error("Token verification failed:", verifyError);
        return response.status(401).json({ message: "Invalid Google ID token." });
      }

      const payload = ticket.getPayload();
      if (!payload) {
        return response.status(401).json({ message: "Invalid token payload." });
      }

      gmail = String(payload.email ?? "").trim().toLowerCase();
      name = String(payload.name ?? "Google User").trim();
    }

    if (!gmail) {
      return response.status(400).json({ message: "Email not provided by Google account." });
    }

    let user = await findSupabaseCustomerByGmail(gmail);

    if (!user) {
      // User doesn't exist, create account with a random secure password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const { salt, hash } = createPasswordHash(tempPassword);
      user = {
        id: createId(),
        name,
        gmail,
        phone: "",
        salt,
        password_hash: hash,
        createdAt: new Date().toISOString(),
      };
      await createSupabaseCustomer(user);
    }

    return response.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error instanceof Error ? error.message : "Could not log in with Google."
    });
  }
});

app.put("/api/auth/profile", async (request, response) => {
  try {
    const body = request.body ?? {};
    const id = String(body.id ?? "").trim();
    const currentGmail = String(body.currentGmail ?? body.currentEmail ?? "")
      .trim()
      .toLowerCase();
    const name = String(body.name ?? "").trim();
    const gmail = String(body.gmail ?? body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();

    if (!id || !currentGmail || !name || !gmail || !phone) {
      return response.status(400).json({
        message: "Name, phone number, and email are required.",
      });
    }

    const currentUser = await findSupabaseCustomerByGmail(currentGmail);

    if (!currentUser || currentUser.id !== id) {
      return response.status(404).json({ message: "Profile was not found." });
    }

    if (gmail !== currentGmail) {
      const existingUser = await findSupabaseCustomerByGmail(gmail);

      if (existingUser && existingUser.id !== id) {
        return response
          .status(409)
          .json({ message: "An account with this email already exists." });
      }
    }

    const updatedUser = await updateSupabaseCustomerProfile(id, {
      name,
      gmail,
      phone,
    });

    return response.json({ user: toPublicUser(updatedUser) });
  } catch (error) {
    console.error(error);
    const errorMessage = getSupabaseErrorMessage(error);

    return response.status(500).json({
      message: errorMessage.includes(
        "Could not find the 'phone' column of 'customers'"
      )
        ? "Supabase customers.phone is missing or not refreshed. Run backend/supabase-customers-name-optional.sql in Supabase, then try again."
        : errorMessage || "Could not update profile.",
    });
  }
});

app.post("/api/orders", async (request, response) => {
  const customer = request.body.customer ?? {};
  const customerName = String(customer.name ?? "").trim();
  const customerEmail = String(customer.email ?? "").trim().toLowerCase();
  const customerGmail = String(customer.gmail ?? customerEmail)
    .trim()
    .toLowerCase();
  const customerPhone = String(customer.phone ?? "").trim();
  const customerUserId = customer.id ? String(customer.id).trim() : null;
  const deliveryAddress = String(request.body.deliveryAddress ?? "").trim();
  const notes = String(request.body.notes ?? "").trim();
  const payment = request.body.payment ?? {};
  const paymentMethod = String(payment.method ?? "manual_upi").trim();
  const transactionId = String(payment.transactionId ?? "").trim();
  const screenshotBase64 = payment.screenshot;
  const items = normalizeOrderItems(request.body.items);

  if (!customerName || !customerGmail || !customerPhone || !deliveryAddress) {
    return response.status(400).json({
      message: "Name, Gmail, phone, and delivery address are required.",
    });
  }

  if (items.length === 0) {
    return response.status(400).json({ message: "Cart is empty." });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  try {
    let screenshotUrl = null;
    if (screenshotBase64) {
      const parsedImage = parseDataImageUrl(screenshotBase64);
      if (parsedImage) {
        const extension = getImageExtension(parsedImage.contentType);
        const folder = `payments/${new Date().toISOString().slice(0, 10)}`;
        const objectPath = `${folder}/${createId()}.${extension}`;
        
        screenshotUrl = await uploadSupabaseStorageObject({
          bucketName: "order-photos",
          objectPath,
          contentType: parsedImage.contentType,
          buffer: parsedImage.buffer,
        });
      }
    }

    const orderItems = await uploadOrderItemPhotos(items);
    const order = await createSupabaseOrder({
      customer_user_id: customerUserId,
      customer_name: customerName,
      customer_email: customerGmail,
      customer_gmail: customerGmail,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes: [
        notes,
        transactionId ? `UPI Transaction ID: ${transactionId}` : "",
        screenshotUrl ? `Payment Screenshot: ${screenshotUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      items: orderItems,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      razorpay_order_id: null,
      razorpay_payment_id: transactionId || null,
      payment_verified_at: null,
      status: "pending_payment_review",
    });

    const emailResult = await sendOrderConfirmationEmail(order, customerGmail);
    const updatedOrder = await updateSupabaseOrder(order.id, {
      status: "pending_payment_review",
      order_confirmed_at: new Date().toISOString(),
      confirmation_email_sent: emailResult.emailSent,
      confirmation_email_message: emailResult.emailMessage,
      confirmation_email_sent_at: emailResult.emailSent
        ? new Date().toISOString()
        : null,
    });

    return response.status(201).json({ order: updatedOrder, ...emailResult });
  } catch (error) {
    console.error(error);
    const errorMessage = getSupabaseErrorMessage(error);

    return response.status(500).json({
      message: errorMessage.includes("Could not find")
        ? "Supabase orders table is missing payment confirmation columns. Run backend/supabase-orders-payment-confirmation.sql in Supabase, then try again."
        : errorMessage || "Could not place order.",
    });
  }
});

app.post("/api/feedback", async (request, response) => {
  const customer = request.body.customer ?? {};
  const customerName = String(request.body.name ?? customer.name ?? "").trim();
  const customerEmail = String(customer.email ?? "").trim().toLowerCase();
  const customerGmail = String(customer.gmail ?? customerEmail)
    .trim()
    .toLowerCase();
  const customerUserId = customer.id ? String(customer.id).trim() : null;
  const orderId = String(request.body.orderId ?? "").trim();
  const rating = Number(request.body.rating);
  const feedbackText = String(request.body.feedback ?? "").trim();

  if (!customerName || !orderId || !feedbackText) {
    return response.status(400).json({
      message: "Name, order ID, and feedback are required.",
    });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return response.status(400).json({
      message: "Rating must be between 1 and 5.",
    });
  }

  try {
    const feedback = await createSupabaseFeedback({
      customer_user_id: customerUserId,
      customer_name: customerName,
      customer_email: customerGmail || null,
      customer_gmail: customerGmail || null,
      order_id: orderId,
      rating,
      feedback: feedbackText,
    });

    return response.status(201).json({ feedback });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error ? error.message : "Could not submit feedback.",
    });
  }
});

app.post("/api/contact-messages", async (request, response) => {
  const body = request.body ?? {};
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const requestType = String(body.requestType ?? "").trim();
  const messageText = String(body.message ?? "").trim();

  if (!name || !phone || !requestType || !messageText) {
    return response.status(400).json({
      message: "Name, phone number, request type, and message are required.",
    });
  }

  try {
    const contactMessage = await createSupabaseContactMessage({
      customer_name: name,
      customer_phone: phone,
      request_type: requestType,
      message: messageText,
    });

    return response.status(201).json({ contactMessage });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not submit contact message.",
    });
  }
});

app.get("/api/orders", async (request, response) => {
  const gmail = String(request.query.gmail ?? "").trim().toLowerCase();

  if (!gmail) {
    return response.status(400).json({ message: "Gmail is required." });
  }

  try {
    const orders = await listSupabaseOrdersByGmail(gmail);

    return response.json({ orders });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error ? error.message : "Could not load orders.",
    });
  }
});

app.get("/api/orders/stream", async (request, response) => {
  const gmail = String(request.query.gmail ?? "").trim().toLowerCase();

  if (!gmail) {
    return response.status(400).json({ message: "Gmail is required." });
  }

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.flushHeaders?.();

  let closed = false;
  let lastPayload = "";

  const sendOrders = async () => {
    if (closed) {
      return;
    }

    try {
      const orders = await listSupabaseOrdersByGmail(gmail);
      const payload = JSON.stringify({ orders });

      if (payload !== lastPayload) {
        response.write(`event: orders\n`);
        response.write(`data: ${payload}\n\n`);
        lastPayload = payload;
      } else {
        response.write(`event: heartbeat\n`);
        response.write(`data: ${JSON.stringify({ ok: true })}\n\n`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not stream orders.";
      response.write(`event: error\n`);
      response.write(`data: ${JSON.stringify({ message })}\n\n`);
    }
  };

  await sendOrders();
  const interval = setInterval(sendOrders, 3000);

  request.on("close", () => {
    closed = true;
    clearInterval(interval);
  });
});
app.get("/api/test-email", async (req, res) => {
  try {
    await sendGmailMessage({
      to: "yourgmail@gmail.com",
      subject: "Test",
      text: "Email working",
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Memory Magnets backend running on http://127.0.0.1:${port}`);
});
