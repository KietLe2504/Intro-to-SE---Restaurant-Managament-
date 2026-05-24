-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "Table" (
    "table_id" TEXT NOT NULL,
    "table_number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "location" TEXT,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "Dish" (
    "dish_id" TEXT NOT NULL,
    "dish_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("dish_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membership_id" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "membership_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "min_spend" DECIMAL(12,2) NOT NULL,
    "point_rate" DECIMAL(5,2) NOT NULL,
    "benefit_description" TEXT,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" TEXT NOT NULL,
    "order_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "table_id" TEXT,
    "employee_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "notes" TEXT,
    "order_type" TEXT NOT NULL DEFAULT 'dine-in',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "order_item_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "is_served" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "EventPromotion" (
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "min_order" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventPromotion_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "order_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("order_id","event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Table_table_number_key" ON "Table"("table_number");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "EventPromotion_code_key" ON "EventPromotion"("code");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "Membership"("membership_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("table_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "Dish"("dish_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "EventPromotion"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
