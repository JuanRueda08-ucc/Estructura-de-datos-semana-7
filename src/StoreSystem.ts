/**
 * ============================================================
 * StoreSystem.ts - Core Workflow Manager
 * ============================================================
 *
 * This is the CENTRAL class of the application.
 * It manages ALL the workflow LISTS (arrays) and provides
 * methods to manipulate orders across the different stages.
 *
 * ===================== LIST ARCHITECTURE =====================
 *
 * The system uses 9 separate LISTS (arrays) to represent
 * different stages of the store order workflow:
 *
 *   1. requisitionOrders : Order[]  → New requisitions
 *   2. quoteRequests     : Order[]  → Awaiting quote
 *   3. quoteEvaluation   : Order[]  → Quotes being evaluated
 *   4. approvedQuotes    : Order[]  → Supervisor-approved quotes
 *   5. orderPreparation  : Order[]  → Orders being prepared
 *   6. orderReview       : Order[]  → Orders under review
 *   7. fulfilledOrders   : Order[]  → Completed/fulfilled orders
 *   8. deliveredOrders   : Order[]  → Products delivered
 *   9. paymentCompleted  : Order[]  → Payment received, done
 *
 * Each list stores Order objects. When an order progresses
 * through the workflow, it is:
 *   1. Found in its current list using findIndex()
 *   2. Removed from the current list using splice()
 *   3. Its status is updated to the new WorkflowStage
 *   4. Pushed into the next list using push()
 *
 * This demonstrates how LISTS (arrays) can be used to manage
 * objects in different stages of a business process.
 *
 * ===================== CRUD OPERATIONS =======================
 *
 * The system also provides standard CRUD operations:
 *   - searchOrder(id)          → find across ALL lists
 *   - addOrder(order)          → add to requisitionOrders
 *   - deleteOrder(id)          → remove from ANY list
 *   - updateOrder(id, newData) → update in ANY list
 *   - listOrders()             → return ALL orders from ALL lists
 *
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";
import { BuyerAgent } from "./BuyerAgent.ts";
import { Supervisor } from "./Supervisor.ts";
import { Seller } from "./Seller.ts";
import { ReceiveAgent } from "./ReceiveAgent.ts";
import { ShoppingOffice } from "./ShoppingOffice.ts";

/**
 * Class: StoreSystem
 *
 * Central workflow manager that holds all 9 workflow lists
 * and provides methods to move orders between them.
 */
export class StoreSystem {
  // =========================================================
  // WORKFLOW LISTS (ARRAYS)
  // Each list represents a stage in the order process.
  // Orders are stored as Order objects inside these arrays.
  // =========================================================

  /**
   * List 1: Orders that have just been created as requisitions.
   * This is the ENTRY POINT of the workflow.
   * New orders are added here via addOrder() or push().
   */
  public requisitionOrders: Order[] = [];

  /**
   * List 2: Orders for which a quote has been requested.
   * Orders move here from requisitionOrders[] when the
   * BuyerAgent prepares a Request for Quote (RFQ).
   */
  public quoteRequests: Order[] = [];

  /**
   * List 3: Orders whose quotes are being evaluated.
   * Orders move here from quoteRequests[] when the
   * BuyerAgent performs quote evaluation.
   */
  public quoteEvaluation: Order[] = [];

  /**
   * List 4: Orders whose quotes have been approved by the Supervisor.
   * Orders move here from quoteEvaluation[] after supervisor approval.
   * Quote preparation and review also happen in this stage.
   */
  public approvedQuotes: Order[] = [];

  /**
   * List 5: Orders that are being prepared for fulfillment.
   * Orders move here from approvedQuotes[] after the quote
   * is accepted and order preparation begins.
   */
  public orderPreparation: Order[] = [];

  /**
   * List 6: Orders under review before fulfillment.
   * Orders move here from orderPreparation[] for the
   * Seller to review the order details.
   */
  public orderReview: Order[] = [];

  /**
   * List 7: Orders that have been fulfilled.
   * Orders move here from orderReview[] after the Seller
   * completes the order fulfillment.
   */
  public fulfilledOrders: Order[] = [];

  /**
   * List 8: Orders whose products have been delivered.
   * Orders move here from fulfilledOrders[] when the
   * ReceiveAgent confirms product delivery.
   */
  public deliveredOrders: Order[] = [];

  /**
   * List 9: Orders whose payment has been completed.
   * This is the FINAL stage. Orders move here from
   * deliveredOrders[] after customer payment.
   */
  public paymentCompleted: Order[] = [];

  // =========================================================
  // WORKFLOW ACTORS (OOP composition)
  // Each actor class handles specific stages of the process.
  // =========================================================
  public shoppingOffice: ShoppingOffice;
  public buyerAgent: BuyerAgent;
  public supervisor: Supervisor;
  public seller: Seller;
  public receiveAgent: ReceiveAgent;

  /** Auto-incrementing counter for generating unique order IDs */
  private orderCounter: number = 0;

  constructor() {
    // Initialize all workflow actors
    this.shoppingOffice = new ShoppingOffice("Central Office");
    this.buyerAgent = new BuyerAgent("Carlos M.", "BA-001");
    this.supervisor = new Supervisor("Ana R.", "Purchasing");
    this.seller = new Seller("Miguel T.", "SL-001");
    this.receiveAgent = new ReceiveAgent("Laura P.", "WH-001");
  }

  // =========================================================
  // CRUD OPERATIONS
  // Standard Create, Read, Update, Delete operations
  // that work across ALL lists.
  // =========================================================

  /**
   * Generates a unique order ID.
   * @returns A new unique order ID string
   */
  public generateOrderId(): string {
    this.orderCounter++;
    return `ORD-${String(this.orderCounter).padStart(4, "0")}`;
  }

  /**
   * Searches for an order by ID across ALL lists.
   *
   * LIST OPERATION: Iterates through ALL 9 lists using
   * Array.find() to locate the order by its ID.
   *
   * @param id - The order ID to search for
   * @returns The found Order or null if not found
   */
  public searchOrder(id: string): Order | null {
    // Collect all lists into a single array of arrays
    const allLists: Order[][] = this.getAllLists();

    // Search through each list using Array.find()
    for (const list of allLists) {
      const found = list.find((order) => order.id === id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Adds a new order to the requisitionOrders list.
   *
   * LIST OPERATION: Uses Array.push() to add the order
   * to the end of the requisitionOrders[] list.
   *
   * @param order - The Order object to add
   */
  public addOrder(order: Order): void {
    // Push the new order into the first workflow list
    this.requisitionOrders.push(order);
    console.log(
      `[StoreSystem] Order ${order.id} added to requisitionOrders[] (List size: ${this.requisitionOrders.length})`
    );
  }

  /**
   * Deletes an order by ID from whichever list it is in.
   *
   * LIST OPERATION: Uses Array.findIndex() to locate the order,
   * then Array.splice() to remove it from the list.
   *
   * @param id - The order ID to delete
   * @returns true if deleted, false if not found
   */
  public deleteOrder(id: string): boolean {
    const allLists = this.getAllLists();

    for (const list of allLists) {
      // Find the index of the order in this list
      const index = list.findIndex((order) => order.id === id);
      if (index !== -1) {
        // Remove the order using splice(index, 1)
        const removed = list.splice(index, 1);
        console.log(
          `[StoreSystem] Order ${removed[0].id} deleted from list (Remaining: ${list.length})`
        );
        return true;
      }
    }
    console.log(`[StoreSystem] Order ${id} not found for deletion`);
    return false;
  }

  /**
   * Updates an order by ID with new data.
   *
   * LIST OPERATION: Uses Array.findIndex() to locate the order
   * in its current list, then updates its properties in-place.
   *
   * @param id       - The order ID to update
   * @param newOrder - The new order data to apply
   * @returns true if updated, false if not found
   */
  public updateOrder(id: string, newOrder: Partial<Order>): boolean {
    const order = this.searchOrder(id);
    if (order) {
      // Update only the provided fields
      if (newOrder.customerName !== undefined)
        order.customerName = newOrder.customerName;
      if (newOrder.product !== undefined) order.product = newOrder.product;
      if (newOrder.price !== undefined) order.price = newOrder.price;
      console.log(`[StoreSystem] Order ${id} updated successfully`);
      return true;
    }
    console.log(`[StoreSystem] Order ${id} not found for update`);
    return false;
  }

  /**
   * Lists ALL orders across ALL workflow lists.
   *
   * LIST OPERATION: Concatenates all 9 lists using the
   * spread operator to produce a single flat list.
   *
   * @returns An array containing every order in the system
   */
  public listOrders(): Order[] {
    return [
      ...this.requisitionOrders,
      ...this.quoteRequests,
      ...this.quoteEvaluation,
      ...this.approvedQuotes,
      ...this.orderPreparation,
      ...this.orderReview,
      ...this.fulfilledOrders,
      ...this.deliveredOrders,
      ...this.paymentCompleted,
    ];
  }

  // =========================================================
  // WORKFLOW TRANSITION METHODS
  // These methods move orders between lists (arrays).
  // Each method:
  //   1. Finds the order in the SOURCE list
  //   2. Removes it using splice()
  //   3. Updates its status
  //   4. Pushes it into the TARGET list
  // =========================================================

  /**
   * Moves an order from requisitionOrders[] → quoteRequests[]
   * Stage: REQUEST_FOR_QUOTE
   *
   * LIST OPERATION:
   *   - splice() from requisitionOrders[]
   *   - push() into quoteRequests[]
   *
   * @param orderId - The ID of the order to move
   * @returns true if successful, false if order not found
   */
  public requestQuote(orderId: string): boolean {
    return this.moveOrder(
      this.requisitionOrders,
      this.quoteRequests,
      orderId,
      WorkflowStage.REQUEST_FOR_QUOTE,
      "requisitionOrders",
      "quoteRequests"
    );
  }

  /**
   * Moves an order from quoteRequests[] → quoteEvaluation[]
   * Stage: QUOTE_EVALUATION
   *
   * LIST OPERATION:
   *   - splice() from quoteRequests[]
   *   - push() into quoteEvaluation[]
   */
  public evaluateQuote(orderId: string): boolean {
    return this.moveOrder(
      this.quoteRequests,
      this.quoteEvaluation,
      orderId,
      WorkflowStage.QUOTE_EVALUATION,
      "quoteRequests",
      "quoteEvaluation"
    );
  }

  /**
   * Moves an order from quoteEvaluation[] → approvedQuotes[]
   * Stage: SUPERVISOR_APPROVAL
   *
   * LIST OPERATION:
   *   - splice() from quoteEvaluation[]
   *   - push() into approvedQuotes[]
   */
  public approveQuote(orderId: string): boolean {
    return this.moveOrder(
      this.quoteEvaluation,
      this.approvedQuotes,
      orderId,
      WorkflowStage.SUPERVISOR_APPROVAL,
      "quoteEvaluation",
      "approvedQuotes"
    );
  }

  /**
   * Moves an order from approvedQuotes[] → orderPreparation[]
   * Stage: ORDER_PREPARATION
   *
   * This combines several diagram steps:
   * - Quote preparation (Seller)
   * - Quote review (ShoppingOffice)
   * - Order preparation (BuyerAgent)
   *
   * LIST OPERATION:
   *   - splice() from approvedQuotes[]
   *   - push() into orderPreparation[]
   */
  public prepareOrder(orderId: string): boolean {
    return this.moveOrder(
      this.approvedQuotes,
      this.orderPreparation,
      orderId,
      WorkflowStage.ORDER_PREPARATION,
      "approvedQuotes",
      "orderPreparation"
    );
  }

  /**
   * Moves an order from orderPreparation[] → orderReview[]
   * Stage: ORDER_REVIEW
   *
   * LIST OPERATION:
   *   - splice() from orderPreparation[]
   *   - push() into orderReview[]
   */
  public reviewOrder(orderId: string): boolean {
    return this.moveOrder(
      this.orderPreparation,
      this.orderReview,
      orderId,
      WorkflowStage.ORDER_REVIEW,
      "orderPreparation",
      "orderReview"
    );
  }

  /**
   * Moves an order from orderReview[] → fulfilledOrders[]
   * Stage: ORDER_FULFILLMENT
   *
   * LIST OPERATION:
   *   - splice() from orderReview[]
   *   - push() into fulfilledOrders[]
   */
  public fulfillOrder(orderId: string): boolean {
    return this.moveOrder(
      this.orderReview,
      this.fulfilledOrders,
      orderId,
      WorkflowStage.ORDER_FULFILLMENT,
      "orderReview",
      "fulfilledOrders"
    );
  }

  /**
   * Moves an order from fulfilledOrders[] → deliveredOrders[]
   * Stage: PRODUCT_DELIVERY
   *
   * LIST OPERATION:
   *   - splice() from fulfilledOrders[]
   *   - push() into deliveredOrders[]
   */
  public deliverOrder(orderId: string): boolean {
    return this.moveOrder(
      this.fulfilledOrders,
      this.deliveredOrders,
      orderId,
      WorkflowStage.PRODUCT_DELIVERY,
      "fulfilledOrders",
      "deliveredOrders"
    );
  }

  /**
   * Moves an order from deliveredOrders[] → paymentCompleted[]
   * Stage: CUSTOMER_PAYMENT
   *
   * This is the FINAL transition. After this, the order
   * workflow is complete.
   *
   * LIST OPERATION:
   *   - splice() from deliveredOrders[]
   *   - push() into paymentCompleted[]
   */
  public completePayment(orderId: string): boolean {
    return this.moveOrder(
      this.deliveredOrders,
      this.paymentCompleted,
      orderId,
      WorkflowStage.CUSTOMER_PAYMENT,
      "deliveredOrders",
      "paymentCompleted"
    );
  }

  // =========================================================
  // HELPER METHODS
  // =========================================================

  /**
   * Core helper that moves an order from one list to another.
   *
   * This method demonstrates the fundamental LIST operations:
   *   1. findIndex() - locates the order in the source list
   *   2. splice()    - removes the order from the source list
   *   3. push()      - adds the order to the target list
   *
   * @param source     - The source list (array) to remove from
   * @param target     - The target list (array) to add to
   * @param orderId    - The ID of the order to move
   * @param newStatus  - The new WorkflowStage for the order
   * @param sourceName - Name of the source list (for logging)
   * @param targetName - Name of the target list (for logging)
   * @returns true if the order was moved, false if not found
   */
  private moveOrder(
    source: Order[],
    target: Order[],
    orderId: string,
    newStatus: WorkflowStage,
    sourceName: string,
    targetName: string
  ): boolean {
    // Step 1: Find the index of the order in the SOURCE list
    const index = source.findIndex((order) => order.id === orderId);

    if (index === -1) {
      console.log(
        `[StoreSystem] Order ${orderId} not found in ${sourceName}[]`
      );
      return false;
    }

    // Step 2: Remove the order from the SOURCE list using splice()
    // splice(index, 1) removes exactly 1 element at the given index
    // and returns an array of removed elements
    const [order] = source.splice(index, 1);

    // Step 3: Update the order's workflow status
    order.status = newStatus;

    // Step 4: Add the order to the TARGET list using push()
    target.push(order);

    console.log(
      `[StoreSystem] Order ${orderId} moved: ${sourceName}[] → ${targetName}[] | Status: ${STAGE_LABELS[newStatus]}`
    );
    console.log(
      `  └─ ${sourceName}[] size: ${source.length} | ${targetName}[] size: ${target.length}`
    );

    return true;
  }

  /**
   * Returns all 9 workflow lists as an array of arrays.
   * Useful for searching across all lists or getting totals.
   *
   * @returns Array containing all 9 workflow lists
   */
  private getAllLists(): Order[][] {
    return [
      this.requisitionOrders,
      this.quoteRequests,
      this.quoteEvaluation,
      this.approvedQuotes,
      this.orderPreparation,
      this.orderReview,
      this.fulfilledOrders,
      this.deliveredOrders,
      this.paymentCompleted,
    ];
  }

  /**
   * Returns a map of list names to their contents.
   * Useful for UI rendering.
   */
  public getListsMap(): {
    name: string;
    key: string;
    list: Order[];
    stage: WorkflowStage;
  }[] {
    return [
      {
        name: "Requisition Orders",
        key: "requisitionOrders",
        list: this.requisitionOrders,
        stage: WorkflowStage.REQUISITION_CREATED,
      },
      {
        name: "Quote Requests",
        key: "quoteRequests",
        list: this.quoteRequests,
        stage: WorkflowStage.REQUEST_FOR_QUOTE,
      },
      {
        name: "Quote Evaluation",
        key: "quoteEvaluation",
        list: this.quoteEvaluation,
        stage: WorkflowStage.QUOTE_EVALUATION,
      },
      {
        name: "Approved Quotes",
        key: "approvedQuotes",
        list: this.approvedQuotes,
        stage: WorkflowStage.SUPERVISOR_APPROVAL,
      },
      {
        name: "Order Preparation",
        key: "orderPreparation",
        list: this.orderPreparation,
        stage: WorkflowStage.ORDER_PREPARATION,
      },
      {
        name: "Order Review",
        key: "orderReview",
        list: this.orderReview,
        stage: WorkflowStage.ORDER_REVIEW,
      },
      {
        name: "Fulfilled Orders",
        key: "fulfilledOrders",
        list: this.fulfilledOrders,
        stage: WorkflowStage.ORDER_FULFILLMENT,
      },
      {
        name: "Delivered Orders",
        key: "deliveredOrders",
        list: this.deliveredOrders,
        stage: WorkflowStage.PRODUCT_DELIVERY,
      },
      {
        name: "Payment Completed",
        key: "paymentCompleted",
        list: this.paymentCompleted,
        stage: WorkflowStage.CUSTOMER_PAYMENT,
      },
    ];
  }

  /**
   * Gets the total number of orders across all lists.
   */
  public getTotalOrders(): number {
    return this.listOrders().length;
  }

  /**
   * Determines which transition method to call for a given order
   * based on its current status.
   *
   * @param orderId - The ID of the order to advance
   * @returns true if the order was advanced, false otherwise
   */
  public advanceOrder(orderId: string): boolean {
    const order = this.searchOrder(orderId);
    if (!order) return false;

    // Determine the appropriate transition based on current stage
    switch (order.status) {
      case WorkflowStage.REQUISITION_CREATED:
        return this.requestQuote(orderId);
      case WorkflowStage.REQUEST_FOR_QUOTE:
        return this.evaluateQuote(orderId);
      case WorkflowStage.QUOTE_EVALUATION:
        return this.approveQuote(orderId);
      case WorkflowStage.SUPERVISOR_APPROVAL:
        return this.prepareOrder(orderId);
      case WorkflowStage.ORDER_PREPARATION:
        return this.reviewOrder(orderId);
      case WorkflowStage.ORDER_REVIEW:
        return this.fulfillOrder(orderId);
      case WorkflowStage.ORDER_FULFILLMENT:
        return this.deliverOrder(orderId);
      case WorkflowStage.PRODUCT_DELIVERY:
        return this.completePayment(orderId);
      case WorkflowStage.CUSTOMER_PAYMENT:
        console.log(
          `[StoreSystem] Order ${orderId} has already completed the workflow`
        );
        return false;
      default:
        return false;
    }
  }
}
