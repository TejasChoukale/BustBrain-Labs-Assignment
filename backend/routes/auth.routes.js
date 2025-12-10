import express from "express";
import axios from "axios";
import crypto from "crypto";
import { User } from "../models/User.js";

const router = express.Router();

/**
 * PKCE helpers for local dev
 */
const CODE_VERIFIER =
  "this_is_a_super_long_random_code_verifier_value_1234567890_abcdefghijk";

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const CODE_CHALLENGE = base64UrlEncode(
  crypto.createHash("sha256").update(CODE_VERIFIER).digest()
);
const STATE = "fixed_dev_state_value_123";

/* ---------- CONTROLLERS ---------- */

// Step 1: Redirect user to Airtable OAuth page (PKCE S256 + state)
export const initiateAirtableOAuth = (req, res) => {
  const clientId = process.env.AIRTABLE_CLIENT_ID;
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({
      success: false,
      message: "OAuth configuration missing",
    });
  }

  const scope =
    "data.records:read data.records:write schema.bases:read user.email:read";

  const authUrl =
    "https://airtable.com/oauth2/v1/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&code_challenge=${encodeURIComponent(CODE_CHALLENGE)}` +
    `&code_challenge_method=S256` +
    `&state=${encodeURIComponent(STATE)}`;

  console.log("AUTH URL:", authUrl);

  return res.redirect(authUrl);
};

// Step 2: Handle callback from Airtable (exchange code + PKCE verifier)
export const handleAirtableCallback = async (req, res) => {
  try {
    console.log("CALLBACK QUERY:", req.query);
    const { code, error, error_description, state } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: "OAuth error from Airtable",
        error,
        error_description,
        state,
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    console.log("STATE RETURNED FROM AIRTABLE:", state);

    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: CODE_VERIFIER, // must match what we hashed
    }).toString();

    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      "https://api.airtable.com/v0/meta/whoami",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id: airtableUserId, email } = userInfoResponse.data;

    let user = await User.findOne({ airtableUserId });

    if (user) {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.email = email || user.email;
      await user.save();
    } else {
      user = await User.create({
        airtableUserId,
        email: email || `user_${airtableUserId}@airtable.com`,
        accessToken: access_token,
        refreshToken: refresh_token,
      });
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?userId=${user._id}`
    );
  } catch (error) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "OAuth failed",
      error: error.response?.data || error.message,
    });
  }
};

// Get current logged in user info
export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    const user = await User.findById(userId).select(
      "-accessToken -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("get user error:", error.message);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

/* ---------- ROUTES ---------- */

router.get("/airtable", initiateAirtableOAuth);
router.get("/airtable/callback", handleAirtableCallback);
router.get("/me", getCurrentUser);

export default router;
