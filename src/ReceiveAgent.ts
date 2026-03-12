/**
 * ============================================================
 * ReceiveAgent.ts - Receive Agent Entity Class
 * ============================================================
 *
 * Represents the Receive Agent lane from the process diagram.
 * The Receive Agent is responsible for:
 *   - Receiving the ordered product (delivery)
 *   - Receiving payment from the customer
 *   - Final product reception (second "Receive ordered product")
 *
 * In the diagram, the Receive Agent lane contains:
 *   - "Receive ordered product" (delivery note + ordered item)
 *   - "Receive payment from customer" (invoice → payment)
 *   - "Receive ordered product" (final reception)
 *
 * LIST OPERATIONS:
 *   - Moves orders from fulfilledOrders[] → deliveredOrders[]
 *   - Moves orders from deliveredOrders[] → paymentCompleted[]
 * ============================================================
 */

import { Order, WorkflowStage, STAGE_LABELS } from "./Order.ts";

/**
 * Class: ReceiveAgent
 *
 * Handles product delivery and payment collection
 * at the end of the store order workflow.
 */
export class ReceiveAgent {
  /** Name of the receive agent */
  public name: string;

  /** Warehouse or reception area identifier */
  public warehouseId: string;

  constructor(name: string, warehouseId: string) {
    this.name = name;
    this.warehouseId = warehouseId;
  }

  /**
   * Receives the ordered product (handles delivery).
   *
   * In the diagram: "Receive ordered product"
   *
   * LIST OPERATION: Moves the order from fulfilledOrders[]
   * to deliveredOrders[].
   *
   * @param order - The order whose product is being received
   * @returns The order with PRODUCT_DELIVERY status
   */
  public receiveProduct(order: Order): Order {
    order.status = WorkflowStage.PRODUCT_DELIVERY;
    console.log(
      `[ReceiveAgent] ${this.name} received product for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Receives payment from the customer.
   *
   * In the diagram: "Receive payment from customer"
   *
   * LIST OPERATION: Moves the order from deliveredOrders[]
   * to paymentCompleted[].
   *
   * @param order - The order whose payment is being collected
   * @returns The order with CUSTOMER_PAYMENT status
   */
  public receivePayment(order: Order): Order {
    order.status = WorkflowStage.CUSTOMER_PAYMENT;
    console.log(
      `[ReceiveAgent] ${this.name} received payment for Order ${order.id} → ${STAGE_LABELS[order.status]}`
    );
    return order;
  }

  /**
   * Returns a string representation of the receive agent.
   */
  public toString(): string {
    return `ReceiveAgent: ${this.name} (Warehouse: ${this.warehouseId})`;
  }
}
