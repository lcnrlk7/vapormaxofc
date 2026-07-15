import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core"

// ---------- Better Auth tables ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------- App tables ----------
// Prices are stored as integer centavos to avoid float rounding issues.
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").default(""),
  category: text("category").notNull().default("descartaveis"),
  brand: text("brand").default(""),
  price: integer("price").notNull().default(0),
  compareAtPrice: integer("compareAtPrice"),
  image: text("image").default(""),
  images: text("images").default(""),
  puffs: text("puffs").default(""),
  nicotine: text("nicotine").default(""),
  flavors: text("flavors").default(""),
  stock: integer("stock").notNull().default(0),
  soldOut: boolean("soldOut").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("orderNumber").notNull(),
  customerName: text("customerName").notNull(),
  customerPhone: text("customerPhone").notNull(),
  customerEmail: text("customerEmail").default(""),
  address: text("address").default(""),
  city: text("city").default(""),
  notes: text("notes").default(""),
  deliveryMethod: text("deliveryMethod").notNull().default("entrega"),
  paymentMethod: text("paymentMethod").notNull().default("pix"),
  subtotal: integer("subtotal").notNull().default(0),
  deliveryFee: integer("deliveryFee").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: text("status").notNull().default("pendente"),
  gateway: text("gateway").notNull().default(""),
  gatewayRef: text("gatewayRef").default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId"),
  productName: text("productName").notNull(),
  flavor: text("flavor").default(""),
  unitPrice: integer("unitPrice").notNull().default(0),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: integer("lineTotal").notNull().default(0),
})

export const paymentLinks = pgTable("payment_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  customerName: text("customerName").notNull().default(""),
  customerPhone: text("customerPhone").notNull().default(""),
  location: text("location").notNull().default(""),
  notes: text("notes").notNull().default(""),
  // JSON: [{ productId, name, flavor, image, unitPrice, quantity }]
  items: text("items").notNull().default("[]"),
  subtotal: integer("subtotal").notNull().default(0),
  deliveryFee: integer("deliveryFee").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: text("status").notNull().default("pendente"),
  gateway: text("gateway").notNull().default("promisepay"),
  gatewayRef: text("gatewayRef").default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export type Product = typeof products.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type PaymentLink = typeof paymentLinks.$inferSelect

export type PaymentLinkItem = {
  productId: number | null
  name: string
  flavor: string
  image: string
  unitPrice: number
  quantity: number
}
