import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(__dirname, ".env");
const app = express();
const port = process.env.PORT || 4000;

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

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  })
);
app.use(express.json({ limit: "10mb" }));

function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
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

  return {
    id: user.id,
    name: user.name,
    email: gmail,
    gmail,
  };
}

function getPriceNumber(price) {
  return Number(String(price).replace(/[^0-9]/g, ""));
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
        lineTotal: unitPrice * quantity,
      };
    })
    .filter((item) => item.id && item.name && item.unitPrice > 0);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), key };
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

  return orders[0];
}

async function listSupabaseOrdersByGmail(gmail) {
  return requestSupabaseTable("orders", {
    query: `customer_gmail=eq.${encodeURIComponent(
      gmail
    )}&select=*&order=created_at.desc`,
  });
}

async function createSupabaseCustomer(user) {
  const customers = await requestSupabaseTable("customers", {
    method: "POST",
    prefer: "return=representation",
    body: {
      id: user.id,
      name: user.name,
      gmail: user.gmail,
      salt: user.salt,
      password_hash: user.password_hash,
      created_at: user.createdAt,
    },
  });

  return customers[0];
}

async function findSupabaseCustomerByGmail(gmail) {
  const customers = await requestSupabaseTable("customers", {
    query: `gmail=eq.${encodeURIComponent(gmail)}&select=*`,
  });

  return customers[0] ?? null;
}

function encodeBase64(value) {
  return Buffer.from(String(value), "utf-8").toString("base64");
}

function formatOrderEmail(order) {
  const itemLines = order.items
    .map(
      (item) =>
        `${item.name} (${item.category}) x ${item.quantity} - Rs. ${item.lineTotal}`
    )
    .join("\n");

  return [
    `Hi ${order.customer_name},`,
    "",
    "Thank you for placing your Memory Magnets order.",
    "",
    `Order ID: ${order.id}`,
    `Total: Rs. ${order.total_amount}`,
    "UPI payment ID: yashihihi@ibl",
    "",
    "Items:",
    itemLines,
    "",
    "Delivery address:",
    order.delivery_address,
    "",
    order.notes ? `Order notes:\n${order.notes}\n` : "",
    "We will contact you soon for the next steps.",
    "",
    "The Memory Magnets",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendGmailMessage({ to, subject, text }) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return { skipped: true };
  }

  const socket = tls.connect(465, "smtp.gmail.com", {
    servername: "smtp.gmail.com",
  });

  const readResponse = () =>
    new Promise((resolve, reject) => {
      let responseText = "";

      const handleData = (chunk) => {
        responseText += chunk.toString("utf-8");
        const lines = responseText.trimEnd().split(/\r?\n/);
        const lastLine = lines[lines.length - 1] ?? "";

        if (/^\d{3} /.test(lastLine)) {
          socket.off("data", handleData);
          resolve(responseText);
        }
      };

      socket.on("data", handleData);
      socket.once("error", reject);
    });

  const sendCommand = async (command, expectedCode) => {
    socket.write(`${command}\r\n`);
    const response = String(await readResponse());

    if (!response.startsWith(expectedCode)) {
      throw new Error(`Gmail SMTP failed: ${response.trim()}`);
    }
  };

  await new Promise((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

  await readResponse();
  await sendCommand("EHLO memory-magnets.local", "250");
  await sendCommand("AUTH LOGIN", "334");
  await sendCommand(encodeBase64(gmailUser), "334");
  await sendCommand(encodeBase64(gmailAppPassword), "235");
  await sendCommand(`MAIL FROM:<${gmailUser}>`, "250");
  await sendCommand(`RCPT TO:<${to}>`, "250");
  await sendCommand("DATA", "354");

  const message = [
    `From: The Memory Magnets <${gmailUser}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    ".",
  ].join("\r\n");

  await sendCommand(message, "250");
  await sendCommand("QUIT", "221");
  socket.end();

  return { skipped: false };
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/signup", async (request, response) => {
  const name = String(request.body.name ?? "").trim();
  const gmail = String(request.body.gmail ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");

  if (!name || !gmail || !password) {
    return response.status(400).json({ message: "Name, Gmail, and password are required." });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: "Password must be at least 6 characters." });
  }

  let existingUser;

  try {
    existingUser = await findSupabaseCustomerByGmail(gmail);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error ? error.message : "Could not check account.",
    });
  }

  if (existingUser) {
    return response.status(409).json({ message: "An account with this email already exists." });
  }

  const { salt, hash } = createPasswordHash(password);
  const user = {
    id: crypto.randomUUID(),
    name,
    gmail,
    salt,
    password_hash: hash,
    createdAt: new Date().toISOString(),
  };

  try {
    await createSupabaseCustomer(user);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not save signup details.",
    });
  }

  return response.status(201).json({ user: toPublicUser(user) });
});

app.post("/api/auth/login", async (request, response) => {
  const gmail = String(request.body.email ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");

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
    const order = await createSupabaseOrder({
      customer_user_id: customerUserId,
      customer_name: customerName,
      customer_email: customerGmail,
      customer_gmail: customerGmail,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes,
      items,
      total_amount: totalAmount,
    });

    let emailSent = false;
    let emailMessage = "Confirmation email is not configured.";

    try {
      const emailResult = await sendGmailMessage({
        to: customerGmail,
        subject: `Memory Magnets order confirmation ${order.id.slice(0, 8)}`,
        text: formatOrderEmail(order),
      });

      emailSent = !emailResult.skipped;
      emailMessage = emailSent
        ? "Confirmation email sent."
        : "Confirmation email is not configured.";
    } catch (emailError) {
      console.error(emailError);
      emailMessage = "Confirmation email could not be sent.";
    }

    return response.status(201).json({ order, emailSent, emailMessage });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message:
        error instanceof Error ? error.message : "Could not place order.",
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

app.listen(port, () => {
  console.log(`Memory Magnets backend running on http://127.0.0.1:${port}`);
});
