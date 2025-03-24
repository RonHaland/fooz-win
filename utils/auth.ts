import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // If no password is provided, this is a session refresh
        if (!credentials.password) {
          const user = await authenticateUser(credentials.email, "", true);
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        const user = await authenticateUser(
          credentials.email,
          credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function authenticateUser(
  email: string,
  password: string,
  skipPasswordCheck: boolean = false
) {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called from the server side");
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return null;
    }

    if (!skipPasswordCheck) {
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return null;
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called from the server side");
  }

  const hashedPassword = await hashPassword(password);

  try {
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Failed to create user");
    }

    const user = result[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error: unknown) {
    console.error("User creation error:", error);
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("23505")) {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      password,
      salt,
      100000,
      64,
      "sha512",
      (err: Error | null, derivedKey: Buffer) => {
        if (err) reject(err);
        resolve(salt + ":" + derivedKey.toString("hex"));
      }
    );
  });
}

async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashedPassword.split(":");
    crypto.pbkdf2(
      password,
      salt,
      100000,
      64,
      "sha512",
      (err: Error | null, derivedKey: Buffer) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      }
    );
  });
}
