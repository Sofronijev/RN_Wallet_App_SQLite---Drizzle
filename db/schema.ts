import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("Users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username", { length: 255 }).default(""),
  password: text("password", { length: 255 }),
  email: text("email", { length: 255 }).unique(),
  createdAt: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`),
  selectedWalletId: integer("selectedWalletId").default(1),
});

// Types Table
export const types = sqliteTable("Types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }),
  type: text("type", { length: 255, enum: ["custom", "system"] }).default("custom"),
  categoryId: integer("categoryId").references(() => categories.id, { onUpdate: "cascade" }),
});

// Categories Table
export const categories = sqliteTable("Categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }),
  type: text("type", { length: 255, enum: ["custom", "system"] }).default("custom"),
});

// Wallet Table
export const wallet = sqliteTable("Wallet", {
  walletId: integer("walletId").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  startingBalance: real("startingBalance").default(0),
  walletName: text("walletName", { length: 255 }).default("My custom wallet"),
  currencyCode: text("currencyCode", { length: 3 }).default("EUR"),
  currencySymbol: text("currencySymbol", { length: 3 }).default("€"),
  type: text("type", { length: 255, enum: ["custom", "system"] }).default("custom"),
  color: text("color", { length: 7 }).default("#3EB489"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

// Transactions Table
export const transactions = sqliteTable("Transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount"),
  description: text("description", { length: 255 }),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  type_id: integer("type_id").references(() => types.id, { onUpdate: "cascade" }),
  categoryId: integer("categoryId").references(() => categories.id, { onUpdate: "cascade" }),
  wallet_id: integer("wallet_id").references(() => wallet.walletId, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

// Transfer Table
export const transfer = sqliteTable("Transfer", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  userId: integer("userId").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  fromWalletId: integer("fromWalletId").references(() => wallet.walletId, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  toWalletId: integer("toWalletId").references(() => wallet.walletId, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  fromTransactionId: integer("fromTransactionId").references(() => transactions.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  toTransactionId: integer("toTransactionId").references(() => transactions.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

//Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  transfers: many(transfer),
  wallet: many(wallet),
  selectedWallet: one(wallet, { fields: [users.selectedWalletId], references: [wallet.walletId] }),
}));

export const typesRelations = relations(types, ({ many, one }) => ({
  transactions: many(transactions),
  category: one(categories, {
    fields: [types.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  types: many(types),
  transactions: many(transactions),
}));

export const walletRelations = relations(wallet, ({ many, one }) => ({
  transactions: many(transactions),
  transfersFrom: many(transfer, { relationName: "transfersFrom" }),
  transfersTo: many(transfer, { relationName: "transfersTo" }),
  user: one(users, {
    fields: [wallet.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.user_id],
    references: [users.id],
  }),
  type: one(types, {
    fields: [transactions.type_id],
    references: [types.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  wallet: one(wallet, {
    fields: [transactions.wallet_id],
    references: [wallet.walletId],
  }),
  transfersFrom: many(transfer),
  transfersTo: many(transfer),
}));

export const transferRelations = relations(transfer, ({ one }) => ({
  user: one(users, {
    fields: [transfer.userId],
    references: [users.id],
  }),
  fromWallet: one(wallet, {
    fields: [transfer.fromWalletId],
    references: [wallet.walletId],
  }),
  toWallet: one(wallet, {
    fields: [transfer.toWalletId],
    references: [wallet.walletId],
  }),
  fromTransaction: one(transactions, {
    fields: [transfer.fromTransactionId],
    references: [transactions.id],
  }),
  toTransaction: one(transactions, {
    fields: [transfer.toTransactionId],
    references: [transactions.id],
  }),
}));
