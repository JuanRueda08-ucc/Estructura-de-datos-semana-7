/**
 * ============================================================
 * Supervisor.ts - Supervisor Entity Class
 * ============================================================
 *
 * Represents the Supervisor lane from the process diagram.
 * The Supervisor is responsible for:
 *   - Reviewing quotation requests
 *   - Approving or rejecting quotes (decision point "Approves?")
 *
 * In the diagram, the Supervisor lane contains:
 *   - "Review quotation request"
 *   - Diamond: "Approves?"  → Yes → continues flow
 *                            → No  → sends back for revision
 *
 * LIST OPERATIONS:
 *   - Moves orders from quoteEvaluation[] → approvedQuotes[]
 *   - If rejected, order stays in quoteEvaluation[] for revision
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";

/**
 * Class: Supervisor
 *
 * Handles quote approval and quotation review in the workflow.
 */
export class Supervisor {
  /** Name of the supervisor */
  public name: string;

  /** Department the supervisor manages */
  public department: string;

  constructor(name: string, department: string) {
    this.name = name;
    this.department = department;
  }

  /**
   * Reviews and approves a quotation request.
   *
   * LIST OPERATION: If approved, the order moves from
   * quoteEvaluation[] to approvedQuotes[].
   * The StoreSystem handles the array splice and push.
   *
   * In the diagram: "Review quotation request" → "Approves?" → Yes
   *
   * @param order - The order whose quote needs approval
   * @returns The order with SUPERVISOR_APPROVAL status
   */
  public approveQuote(order: Order): Order {
    order.status = WorkflowStage.SUPERVISOR_APPROVAL;
    console.log(
      `[Supervisor] ${this.name} APPROVED quote for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Reviews the quotation request details before making a decision.
   *
   * @param order - The order to review
   * @returns A summary string of the review
   */
  public reviewQuotation(order: Order): string {
    const summary = `Supervisor ${this.name} reviewed Order ${order.id}: ${order.product} at $${order.price.toFixed(2)}`;
    console.log(`[Supervisor] ${summary}`);
    return summary;
  }

  /**
   * Returns a string representation of the supervisor.
   */
  public toString(): string {
    return `Supervisor: ${this.name} (${this.department})`;
  }
}
