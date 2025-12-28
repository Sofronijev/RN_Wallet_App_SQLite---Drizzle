import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, AnySQLiteColumn } from "drizzle-orm/sqlite-core";

const DEFAULT_USER_ID = 1;

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
  delimiter: text("delimiter", { length: 5 }).default(".").notNull(),
  decimal: text("decimal", { length: 5 }).default(",").notNull(),
  pinCode: text("pinCode", { length: 8 }).default("").notNull(),
  isPinEnabled: integer("isPinEnabled", { mode: "boolean" }).default(false).notNull(),
  showTotalAmount: integer("showTotalAmount", { mode: "boolean" }).default(true).notNull(),
  inactivePinTimeout: integer("inactivePinTimeout").default(sql`NULL`),
  primaryWalletId: integer("primaryWalletId")
    .references((): AnySQLiteColumn => wallet.walletId, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .default(sql`NULL`),
});

// Types Table
export const types = sqliteTable("Types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  type: text("type", { length: 255, enum: ["custom", "system"] })
    .default("custom")
    .notNull(),
  categoryId: integer("categoryId")
    .references(() => categories.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
});

// Categories Table
export const categories = sqliteTable("Categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  type: text("type", { length: 255, enum: ["custom", "system"] })
    .default("custom")
    .notNull(),
  iconFamily: text("iconFamily", {
    length: 255,
    enum: ["FontAwesome", "FontAwesome5", "MaterialCommunityIcons", "Ionicons"],
  }).notNull(),
  iconName: text("iconName", { length: 255 }).notNull(),
  iconColor: text("iconColor", { length: 255 }).notNull(),
  transactionType: text("transactionType", {
    length: 20,
    enum: ["income", "expense"],
  })
    .default("expense")
    .notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
});

// Wallet Table
export const wallet = sqliteTable("Wallet", {
  walletId: integer("walletId").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .default(DEFAULT_USER_ID)
    .notNull(),
  startingBalance: real("startingBalance").default(0).notNull(),
  walletName: text("walletName", { length: 255 }).default("My custom wallet").notNull(),
  currencyCode: text("currencyCode", { length: 10 }).default(""),
  currencySymbol: text("currencySymbol", { length: 10 }).default(""),
  color: text("color", { length: 7 }).default("#3EB489").notNull(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Transactions Table
export const transactions = sqliteTable("Transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  description: text("description", { length: 300 }),
  date: text("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  user_id: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .default(DEFAULT_USER_ID)
    .notNull(),
  type_id: integer("type_id").references(() => types.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  categoryId: integer("categoryId")
    .references(() => categories.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  wallet_id: integer("wallet_id")
    .references(() => wallet.walletId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  transfer_id: integer("transfer_id").references(() => transfer.id, {
    // in case transfer is deleted when wallet is deleted just set it to null
    // in case transfer is deleted this transaction needs to be deleted manually
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

// Transfer Table
export const transfer = sqliteTable("Transfer", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: integer("userId")
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .default(DEFAULT_USER_ID)
    .notNull(),
  fromWalletId: integer("fromWalletId")
    .references(() => wallet.walletId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  toWalletId: integer("toWalletId")
    .references(() => wallet.walletId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  fromTransactionId: integer("fromTransactionId").notNull(),
  toTransactionId: integer("toTransactionId").notNull(),
});

//Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  transfers: many(transfer),
  wallet: many(wallet),
  selectedWallet: one(wallet, { fields: [users.selectedWalletId], references: [wallet.walletId] }),
  primaryWallet: one(wallet, {
    fields: [users.primaryWalletId],
    references: [wallet.walletId],
  }),
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
  transfer: one(transfer, {
    fields: [transactions.transfer_id],
    references: [transfer.id],
  }),
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
    relationName: "fromTransaction",
  }),
  toTransaction: one(transactions, {
    fields: [transfer.toTransactionId],
    references: [transactions.id],
    relationName: "toTransaction",
  }),
}));
