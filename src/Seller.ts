/**
 * ============================================================
 * Seller.ts - Seller Entity Class
 * ============================================================
 *
 * Represents the Seller lane from the process diagram.
 * The Seller is responsible for:
 *   - Deciding whether to provide a quote ("Decide to quote?")
 *   - Performing actual quote preparation
 *   - Analyzing the quote response
 *   - Performing order review
 *   - Fulfilling the order
 *   - Checking order acceptability ("Order acceptable?")
 *   - Preparing the order invoice
 *
 * LIST OPERATIONS:
 *   - Moves orders through quote preparation and review
 *   - Moves orders from orderPreparation[] → orderReview[]
 *   - Moves orders from orderReview[] → fulfilledOrders[]
 *   - Prepares invoices for fulfilled orders
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";

/**
 * Class: Seller
 *
 * Handles quote preparation, order review, fulfillment,
 * and invoice preparation as shown in the process diagram.
 */
export class Seller {
  /** Name of the seller */
  public name: string;

  /** Seller identification number */
  public sellerId: string;

  constructor(name: string, sellerId: string) {
    this.name = name;
    this.sellerId = sellerId;
  }

  /**
   * Prepares the actual quote for an approved order.
   *
   * In the diagram: "Actual quote preparation"
   *
   * LIST OPERATION: Updates the order status within
   * the approvedQuotes[] list.
   *
   * @param order - The order to prepare a quote for
   * @returns The order with QUOTE_PREPARATION status
   */
  public prepareQuote(order: Order): Order {
    order.status = WorkflowStage.QUOTE_PREPARATION;
    console.log(
      `[Seller] ${this.name} prepared quote for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Analyzes the quote response.
   *
   * In the diagram: "Analyze quote response"
   *
   * @param order - The order whose quote response to analyze
   * @returns The order with QUOTE_REVIEW status
   */
  public analyzeQuoteResponse(order: Order): Order {
    order.status = WorkflowStage.QUOTE_REVIEW;
    console.log(
      `[Seller] ${this.name} analyzed quote response for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Reviews an order for correctness and completeness.
   *
   * In the diagram: "Order review"
   *
   * LIST OPERATION: The order is in orderReview[].
   *
   * @param order - The order to review
   * @returns The order with ORDER_REVIEW status
   */
  public reviewOrder(order: Order): Order {
    order.status = WorkflowStage.ORDER_REVIEW;
    console.log(
      `[Seller] ${this.name} reviewed Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Fulfills an order after it passes review.
   *
   * In the diagram: "Fulfill order"
   *
   * LIST OPERATION: Moves the order from orderReview[]
   * to fulfilledOrders[].
   *
   * @param order - The order to fulfill
   * @returns The order with ORDER_FULFILLMENT status
   */
  public fulfillOrder(order: Order): Order {
    order.status = WorkflowStage.ORDER_FULFILLMENT;
    console.log(
      `[Seller] ${this.name} fulfilled Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Prepares an invoice for a delivered order.
   *
   * In the diagram: "Prepare order invoice"
   *
   * LIST OPERATION: Updates the order status within
   * the deliveredOrders[] list.
   *
   * @param order - The order to prepare an invoice for
   * @returns The order with INVOICE_PREPARATION status
   */
  public prepareInvoice(order: Order): Order {
    order.status = WorkflowStage.INVOICE_PREPARATION;
    console.log(
      `[Seller] ${this.name} prepared invoice for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Returns a string representation of the seller.
   */
  public toString(): string {
    return `Seller: ${this.name} (${this.sellerId})`;
  }
}
