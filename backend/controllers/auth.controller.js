import { User } from "../models/User.js";
import axios from "axios";

// Step 1: Redirect user to Airtable OAuth page
export const initiateAirtableOAuth = (req, res) => {
  const clientId = process.env.AIRTABLE_CLIENT_ID;
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({
      success: false,
      message: "OAuth configuration missing",
    });
  }

  // Airtable OAuth URL
  const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=data.records:read data.records:write schema.bases:read`;

  return res.redirect(authUrl);
};

// Step 2: Handle callback from Airtable
export const handleAirtableCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
      },
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

    // Get user info from Airtable
    const userInfoResponse = await axios.get(
      "https://api.airtable.com/v0/meta/whoami",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id: airtableUserId, email } = userInfoResponse.data;

    // Save or update user in database
    let user = await User.findOne({ airtableUserId });

    if (user) {
      // Update existing user
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.email = email || user.email;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        airtableUserId,
        email: email || `user_${airtableUserId}@airtable.com`,
        accessToken: access_token,
        refreshToken: refresh_token,
      });
    }

    // Redirect to frontend with user ID
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?userId=${user._id}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error.message);
    return res.status(500).json({
      success: false,
      message: "OAuth failed",
      error: error.message,
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

    const user = await User.findById(userId).select("-accessToken -refreshToken");

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