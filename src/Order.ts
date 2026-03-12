/**
 * ============================================================
 * Order.ts - Order Entity Class
 * ============================================================
 *
 * Represents a single purchase order in the store workflow.
 * Each Order object is stored inside one of the workflow LISTS
 * (arrays) managed by the StoreSystem class. When the order
 * advances through the process, it is REMOVED from the current
 * list and PUSHED into the next list.
 *
 * Workflow stages (enum WorkflowStage):
 *   REQUISITION_CREATED  → requisitionOrders[]
 *   REQUEST_FOR_QUOTE    → quoteRequests[]
 *   QUOTE_EVALUATION     → quoteEvaluation[]
 *   SUPERVISOR_APPROVAL  → approvedQuotes[]
 *   QUOTE_PREPARATION    → (handled within approvedQuotes)
 *   QUOTE_REVIEW         → (handled within approvedQuotes)
 *   ORDER_PREPARATION    → orderPreparation[]
 *   ORDER_REVIEW         → orderReview[]
 *   ORDER_FULFILLMENT    → fulfilledOrders[]
 *   PRODUCT_DELIVERY     → deliveredOrders[]
 *   INVOICE_PREPARATION  → (handled within deliveredOrders)
 *   CUSTOMER_PAYMENT     → paymentCompleted[]
 * ============================================================
 */

/**
 * Enum representing every stage in the store order workflow.
 * The numeric values define the natural progression order.
 */
export enum WorkflowStage {
  REQUISITION_CREATED = 1,
  REQUEST_FOR_QUOTE = 2,
  QUOTE_EVALUATION = 3,
  SUPERVISOR_APPROVAL = 4,
  QUOTE_PREPARATION = 5,
  QUOTE_REVIEW = 6,
  ORDER_PREPARATION = 7,
  ORDER_REVIEW = 8,
  ORDER_FULFILLMENT = 9,
  PRODUCT_DELIVERY = 10,
  INVOICE_PREPARATION = 11,
  CUSTOMER_PAYMENT = 12,
}

/**
 * Human-readable labels for each workflow stage.
 * Used in the UI to display the current status of an order.
 */
export const STAGE_LABELS: Record<WorkflowStage, string> = {
  [WorkflowStage.REQUISITION_CREATED]: "Requisition Created",
  [WorkflowStage.REQUEST_FOR_QUOTE]: "Request for Quote",
  [WorkflowStage.QUOTE_EVALUATION]: "Quote Evaluation",
  [WorkflowStage.SUPERVISOR_APPROVAL]: "Supervisor Approval",
  [WorkflowStage.QUOTE_PREPARATION]: "Quote Preparation",
  [WorkflowStage.QUOTE_REVIEW]: "Quote Review",
  [WorkflowStage.ORDER_PREPARATION]: "Order Preparation",
  [WorkflowStage.ORDER_REVIEW]: "Order Review",
  [WorkflowStage.ORDER_FULFILLMENT]: "Order Fulfillment",
  [WorkflowStage.PRODUCT_DELIVERY]: "Product Delivery",
  [WorkflowStage.INVOICE_PREPARATION]: "Invoice Preparation",
  [WorkflowStage.CUSTOMER_PAYMENT]: "Customer Payment",
};

/**
 * Class: Order
 *
 * Core entity that flows through the workflow lists.
 * Contains all the information about a customer purchase order.
 */
export class Order {
  /** Unique identifier for this order */
  public id: string;

  /** Name of the customer who placed the order */
  public customerName: string;

  /** Name or description of the product requested */
  public product: string;

  /** Price of the product in currency units */
  public price: number;

  /** Current workflow stage (status) of this order */
  public status: WorkflowStage;

  /** Timestamp when the order was created */
  public createdAt: Date;

  constructor(
    id: string,
    customerName: string,
    product: string,
    price: number,
    status: WorkflowStage = WorkflowStage.REQUISITION_CREATED
  ) {
    this.id = id;
    this.customerName = customerName;
    this.product = product;
    this.price = price;
    this.status = status;
    this.createdAt = new Date();
  }

  /**
   * Returns a string representation of the order for display.
   */
  public toString(): string {
    return `[${this.id}] ${this.product} — $${this.price.toFixed(2)} | ${STAGE_LABELS[this.status]}`;
  }
}
