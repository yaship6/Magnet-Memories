import express from "express";

const router = express.Router();

// Middleware to authorize admin access using the secret key
router.use((req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_SECRET_KEY;

  if (!expectedKey) {
    console.error("ADMIN_SECRET_KEY is not configured on the server.");
    return res.status(500).json({ message: "Server configuration error: admin secret key is missing." });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({ message: "Unauthorized admin access." });
  }

  next();
});

// GET /api/admin/orders
// Returns all orders from Supabase
router.get("/orders", async (req, res) => {
  const { requestSupabaseTable } = req.app.locals;

  if (!requestSupabaseTable) {
    return res.status(500).json({ message: "Database connection helper not initialized." });
  }

  try {
    const orders = await requestSupabaseTable("orders", {
      query: "select=*&order=created_at.desc",
    });

    res.json({ orders });
  } catch (error) {
    console.error("Admin failed to fetch orders:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to retrieve orders.",
    });
  }
});

// PATCH /api/admin/orders/:id/status
// Updates the status of a specific order in Supabase
router.patch("/orders/:id/status", async (req, res) => {
  const { updateSupabaseOrder } = req.app.locals;
  const { id } = req.params;
  const { status } = req.body;

  if (!updateSupabaseOrder) {
    return res.status(500).json({ message: "Database update helper not initialized." });
  }

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const updatedOrder = await updateSupabaseOrder(id, { status });
    res.json({ order: updatedOrder });
  } catch (error) {
    console.error(`Admin failed to update order ${id} status:`, error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update order status.",
    });
  }
});

// GET /api/admin/feedback
// Returns all user feedback from Supabase
router.get("/feedback", async (req, res) => {
  const { requestSupabaseTable } = req.app.locals;

  if (!requestSupabaseTable) {
    return res.status(500).json({ message: "Database connection helper not initialized." });
  }

  try {
    const feedback = await requestSupabaseTable("feedback", {
      query: "select=*&order=created_at.desc",
    });

    res.json({ feedback });
  } catch (error) {
    console.error("Admin failed to fetch feedback:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to retrieve feedback.",
    });
  }
});

export default router;
