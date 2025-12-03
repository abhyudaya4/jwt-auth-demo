const express = require("express");
const axios = require("axios");

const router = express.Router();

// PUT YOUR N8N WEBHOOK URL (even localhost works, only backend will call)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Route the frontend will call
router.post("/chatbot", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(N8N_WEBHOOK_URL, {
      message: userMessage,
    });

    return res.json({
      reply: response.data.reply || response.data,
    });

  } catch (error) {
    console.error("N8N ERROR:", error.message);
    return res.status(500).json({
      message: "Error communicating with chatbot",
      error: error.message,
    });
  }
});

module.exports = router;
