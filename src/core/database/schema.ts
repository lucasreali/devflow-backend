import { uuid } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().primaryKey(),
    name: text().notNull(),
    password: text().notNull(),
    email: text().notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdateFn(() => new Date())
        .notNull(),
});
