/**
 * ============================================================
 * ShoppingOffice.ts - Shopping Office Entity Class
 * ============================================================
 *
 * Represents the Shopping Office lane from the process diagram.
 * The Shopping Office is responsible for:
 *   - Preparing the initial requisition
 *   - Performing the actual quote review
 *   - Evaluating whether the quote is acceptable
 *   - Initiating order preparation
 *
 * In the diagram, the Shopping Office sits in the first lane
 * and is the starting point for the entire workflow.
 *
 * LIST OPERATIONS:
 *   - Works with requisitionOrders[] (initial list)
 *   - Moves orders to quoteRequests[] via the BuyerAgent
 *   - Reviews quotes and sends to orderPreparation[]
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";

/**
 * Class: ShoppingOffice
 *
 * Handles the initial requisition preparation and quote review
 * stages as shown in the process diagram.
 */
export class ShoppingOffice {
  /** Name identifier for this office */
  public name: string;

  constructor(name: string = "Main Shopping Office") {
    this.name = name;
  }

  /**
   * Prepares a requisition - the first step in the workflow.
   * This sets the order status to REQUISITION_CREATED.
   *
   * LIST OPERATION: The order should be in the requisitionOrders[] list.
   *
   * @param order - The order to prepare as a requisition
   * @returns The order with updated status
   */
  public prepareRequisition(order: Order): Order {
    order.status = WorkflowStage.REQUISITION_CREATED;
    console.log(
      `[ShoppingOffice] Requisition prepared for Order ${order.id}: "${order.product}" → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Performs the actual quote review.
   * Determines if the quote is acceptable.
   *
   * In the diagram: "Actual quote review" → "Quote acceptable?"
   *
   * @param order - The order whose quote is being reviewed
   * @returns true if the quote is acceptable, false otherwise
   */
  public reviewQuote(order: Order): boolean {
    // Simulate quote review - in this simulation, quotes are always acceptable
    const isAcceptable = true;
    console.log(
      `[ShoppingOffice] Quote review for Order ${order.id}: ${isAcceptable ? "ACCEPTABLE" : "NOT ACCEPTABLE"}`
    );
    return isAcceptable;
  }

  /**
   * Returns a string representation of the shopping office.
   */
  public toString(): string {
    return `Shopping Office: ${this.name}`;
  }
}
