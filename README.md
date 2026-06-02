# ✨ The Memory Magnets

Turn your favorite memories into beautiful customized magnets 🧲💖

The Memory Magnets is an AI-powered custom magnet ordering platform where users can:
- 📸 Upload photos
- 🧲 Customize magnets
- 🛒 Place orders
- 🤖 Chat with an AI assistant
- 📊 View analytics and dashboards

This project combines luxury UI/UX, full-stack development, and AI features into a modern startup-style platform 🚀

🛠️ Tech Stack
 Frontend
⚛️ React 19
📘 TypeScript
⚡ Vite
🎨 Tailwind CSS
🧭 React Router DOM
✨ Framer Motion
🎯 Lucide React Icons
🎭 React Icons
🌐 Axios

Backend
🟢 Node.js
🚂 Express.js
🔗 CORS
📦 ES Modules

 Chatbot
🟢 Node.js
🚂 Express.js
🔗 CORS
🛠️ Tooling
🧹 ESLint
🎨 PostCSS
⚡ Autoprefixer
📦 npm


# 🌟 Features

- 🏠 Modern animated landing page
- 🧲 Product collections
- 🎨 Magnet customization page
- 📸 Photo upload + live preview
- 🛒 Cart and order system
- 🤖 Smart chatbot assistant
- 🏢 Society stall booking
- 👤 User dashboard
- 🛠️ Admin dashboard
- 📊 Sales analytics dashboard
- 🧠 AI image quality checker
- 🎯 Magnet recommendation system

---

# 📁 Project Structure

```txt
memory-magnets/
├── frontend/
├── backend/
├── chatbot/
├── database/
└── README.md

WorkFlow:
User opens website
↓
Views magnet collections
↓
Customizes magnet
↓
Uploads photo
↓
Places order
↓
Chatbot helps user
↓
Order is saved in backend
↓
Admin views and manages order

## Pexels API setup

The shop page can pull inspiration images from Pexels through the backend. Keep
the Pexels API key in `backend/.env`; never put it in frontend code.

```env
PEXELS_API_KEY=your_pexels_api_key
```

The frontend uses Pexels images when available and falls back to the built-in
shop images if Pexels is not configured or the request fails.

## Razorpay setup

Razorpay payments are created and verified through the backend. Add your
Razorpay test or live keys to `backend/.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

The Cart page opens Razorpay Checkout, sends the returned payment id, order id,
and signature to the backend, and only saves the Memory Magnets order after the
signature is verified.
