/**
 * ============================================================
 * BuyerAgent.ts - Buyer Agent Entity Class
 * ============================================================
 *
 * Represents the Buyer Agent lane from the process diagram.
 * The Buyer Agent is responsible for:
 *   - Preparing the Request for Quote (RFQ)
 *   - Determining if the quote needs review
 *   - Handling quote request evaluation
 *   - Performing actual quote review and acceptability checks
 *   - Initiating order preparation when the quote is accepted
 *
 * LIST OPERATIONS:
 *   - Moves orders from requisitionOrders[] → quoteRequests[]
 *   - Moves orders from quoteRequests[] → quoteEvaluation[]
 *   - Evaluates quotes and moves to next stages
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";

/**
 * Class: BuyerAgent
 *
 * Handles the quote request and evaluation stages of the workflow.
 */
export class BuyerAgent {
  /** Name of the buyer agent */
  public name: string;

  /** Agent identification number */
  public agentId: string;

  constructor(name: string, agentId: string) {
    this.name = name;
    this.agentId = agentId;
  }

  /**
   * Prepares a Request for Quote (RFQ) for an order.
   *
   * LIST OPERATION: The order moves from requisitionOrders[]
   * to quoteRequests[]. The StoreSystem handles the actual
   * array manipulation (splice from source, push to target).
   *
   * @param order - The order to request a quote for
   * @returns The order with updated status
   */
  public prepareQuoteRequest(order: Order): Order {
    order.status = WorkflowStage.REQUEST_FOR_QUOTE;
    console.log(
      `[BuyerAgent] ${this.name} prepared RFQ for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Evaluates a quote request to determine if it meets requirements.
   *
   * LIST OPERATION: The order moves from quoteRequests[]
   * to quoteEvaluation[]. The evaluation decision determines
   * the next step in the workflow.
   *
   * @param order - The order whose quote needs evaluation
   * @returns The order with updated status
   */
  public evaluateQuote(order: Order): Order {
    order.status = WorkflowStage.QUOTE_EVALUATION;
    console.log(
      `[BuyerAgent] ${this.name} evaluated quote for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Returns a string representation of the buyer agent.
   */
  public toString(): string {
    return `BuyerAgent: ${this.name} (${this.agentId})`;
  }
}
