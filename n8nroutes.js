const express = require("express");
const axios = require("axios");
const authMiddleware = require("./authMiddleware")
const router = express.Router();

// PUT YOUR N8N WEBHOOK URL (even localhost works, only backend will call)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Route the frontend will call
// n8nroutes.js (Update the route handler)

router.post("/chatbot", authMiddleware, async (req, res) => {
  try {
    const {userMessage, sessionId} = req.body;
    const userId = req.user.id;

    if(!sessionId){
      return res.status(400).json({message:"sessionId is required"});
    }
    const response = await axios.post(N8N_WEBHOOK_URL, {
      message: userMessage,
      sessionid: sessionId,
      userid: userId,
    });

    // 🔍 LOGGING: See exactly what n8n sends back in your Render logs
    console.log("✅ n8n Response Data:", JSON.stringify(response.data, null, 2));

    // Extract the text. Adjust 'output', 'text', or 'content' based on what your logs show.
    // If n8n sends { "reply": "Hello" }, this works:
    const botReply = response.data.reply || response.data.output || response.data.text || JSON.stringify(response.data);

    return res.json({
      reply: botReply,
    });

  } catch (error) {
    console.error("❌ N8N ERROR:", error.message);
    if (error.response) {
       console.error("Error Response Data:", error.response.data);
    }
    return res.status(500).json({
      message: "Error communicating with chatbot",
      error: error.message,
    });
  }
});

module.exports = router;
