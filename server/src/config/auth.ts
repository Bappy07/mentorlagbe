
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import type { Db } from "mongodb";

function getOrigins() {
  const configured = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  return Array.from(
    new Set(configured.flatMap((value) => value.split(",").map((v) => v.trim())))
  ).filter(Boolean);
}

export function createAuth(db: Db) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  return betterAuth({
    database: mongodbAdapter(db),

    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    trustedOrigins: getOrigins(),

    emailAndPassword: {
      enabled: true,
    },

    user: {
      modelName: "users",

      additionalFields: {
        role: {
          type: ["student", "tutor", "admin"],
          required: false,
          defaultValue: "student",
          input: true,
        },
        plan: {
          type: "string",
          required: false,
          defaultValue: "free",
          input: false,
        },
        phone: {
          type: "string",
          required: false,
          defaultValue: "",
          input: false,
        },
        bio: {
          type: "string",
          required: false,
          defaultValue: "",
          input: false,
        },
      },
    },

    // Only the configured bootstrap admin email may become an admin at
    // signup. Everyone else is forced to student/tutor, closing the
    // privilege-escalation hole in the original configuration.
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const requested = String((user as { role?: string }).role ?? "");
            const isBootstrapAdmin =
              Boolean(adminEmail) &&
              user.email.toLowerCase() === adminEmail &&
              requested === "admin";

            const role =
              isBootstrapAdmin || requested === "tutor" ? requested : "student";

            return {
              data: {
                ...user,
                role,
                plan: "free",
                phone: "",
                bio: "",
              },
            };
          },
        },
      },
    },

    ...(googleClientId && googleClientSecret
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          },
        }
      : {}),
  });
}
