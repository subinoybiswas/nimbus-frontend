
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const User = sqliteTable("users", {
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    credits: integer("credits").notNull().default(5),
});