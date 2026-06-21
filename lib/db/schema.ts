import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  smallint,
  index,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  creditBalance: integer('credit_balance').notNull().default(0),
  referralCode: varchar('referral_code', { length: 8 }).unique(),
}, (table) => [
  check('credit_balance_non_negative', sql`${table.creditBalance} >= 0`),
]);

export const creditPurchases = pgTable('credit_purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  packType: varchar('pack_type', { length: 20 }).notNull(), // 'small' | 'large' | 'migration'
  creditsPurchased: integer('credits_purchased').notNull(),
  priceCents: integer('price_cents').notNull(),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).unique(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('credit_purchases_user_id_idx').on(table.userId),
  index('credit_purchases_user_id_created_at_idx').on(table.userId, table.createdAt),
]);

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('conversations_user_id_updated_at_idx').on(table.userId, table.updatedAt),
]);

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content'),
  imagePath: text('image_path'),
  promptUsed: text('prompt_used'),
  rating: smallint('rating'), // 1-5 star rating
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('messages_conversation_id_created_at_idx').on(table.conversationId, table.createdAt),
]);

export const coloredPhotos = pgTable('colored_photos', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .references(() => messages.id, { onDelete: 'set null' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  photoPath: text('photo_path').notNull(),
  originalSketchPath: text('original_sketch_path').notNull(),
  compositePath: text('composite_path'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  unique('colored_photos_message_id_unique').on(table.messageId),
  index('colored_photos_user_id_idx').on(table.userId),
  index('colored_photos_user_id_created_at_idx').on(table.userId, table.createdAt),
]);

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refereeId: integer('referee_id')
    .references(() => users.id, { onDelete: 'set null' }),
  refereeEmail: varchar('referee_email', { length: 255 }).notNull().unique(),
  referrerCredited: integer('referrer_credited').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  seenAt: timestamp('seen_at'),
}, (table) => [
  index('referrals_referrer_id_idx').on(table.referrerId),
]);

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => [
  index('activity_logs_user_id_idx').on(table.userId),
]);

export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  activityLogs: many(activityLogs),
  creditPurchases: many(creditPurchases),
  referralsMade: many(referrals, { relationName: 'referrer' }),
}));

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  user: one(users, {
    fields: [creditPurchases.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  coloredPhotos: many(coloredPhotos),
}));

export const coloredPhotosRelations = relations(coloredPhotos, ({ one }) => ({
  message: one(messages, {
    fields: [coloredPhotos.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [coloredPhotos.userId],
    references: [users.id],
  }),
}));

export const stripeWebhookEvents = pgTable('stripe_webhook_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referee: one(users, {
    fields: [referrals.refereeId],
    references: [users.id],
    relationName: 'referee',
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type NewCreditPurchase = typeof creditPurchases.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type ColoredPhoto = typeof coloredPhotos.$inferSelect;
export type NewColoredPhoto = typeof coloredPhotos.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
}
