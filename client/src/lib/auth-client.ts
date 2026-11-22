
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { API_URL } from "./config";

export const authClient = createAuthClient({
  baseURL: API_URL.replace(/\/api$/, ""),

  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
      },
    }),
  ],

  fetchOptions: {
    credentials: "include",
  },
});
