import 'server-only';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";


export const db = drizzle(neon(process.env.POSTGRES_URL!));