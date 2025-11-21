import { defineHTTPRequest } from "helium/server";

// Example OAuth callback for GitHub
export const githubCallback = defineHTTPRequest(
  "GET",
  "/auth/callback/github",
  async (req, ctx) => {
    const { code, state } = req.query;

    console.log("[GitHub OAuth] Callback received:", { code, state });

    // In a real app, you would:
    // 1. Exchange the code for an access token
    // 2. Fetch user info from GitHub
    // 3. Create/update user in your database
    // 4. Create a session
    // 5. Redirect to your app

    return {
      message: "GitHub OAuth callback handled",
      code,
      state,
    };
  }
);

// Example OAuth callback with dynamic provider parameter
export const oauthCallback = defineHTTPRequest(
  "GET",
  "/auth/callback/:provider",
  async (req, ctx) => {
    const { provider } = req.params;
    const { code, state } = req.query;

    console.log(`[OAuth ${provider}] Callback received:`, { code, state });

    // Handle different providers
    switch (provider) {
      case "google":
        // Handle Google OAuth
        break;
      case "github":
        // Handle GitHub OAuth
        break;
      case "discord":
        // Handle Discord OAuth
        break;
      default:
        return { error: "Unknown provider" };
    }

    return {
      message: `${provider} OAuth callback handled`,
      provider,
      code,
      state,
    };
  }
);

// Example for handling logout
export const logoutEndpoint = defineHTTPRequest(
  "POST",
  "/auth/logout",
  async (req, ctx) => {
    // In a real app:
    // 1. Clear the session cookie
    // 2. Invalidate the session in your database

    return {
      success: true,
      message: "Logged out successfully",
    };
  }
);
