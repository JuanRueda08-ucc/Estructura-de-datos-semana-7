/**
 * ============================================================
 * Customer.ts - Customer Entity Class
 * ============================================================
 *
 * Represents a customer (client) in the store system.
 * In the process diagram, the customer initiates the workflow
 * by preparing a requisition through the Shopping Office.
 *
 * The Customer class can create new Order objects which are
 * then added to the requisitionOrders[] list (array).
 * ============================================================
 */

import { Order, WorkflowStage } from "./Order.ts";

/**
 * Class: Customer
 *
 * Represents a client who places orders in the store system.
 * The customer initiates the entire workflow process.
 */
export class Customer {
  /** Customer name */
  public name: string;

  /** Customer email address */
  public email: string;

  /** Customer phone number */
  public phone: string;

  constructor(name: string, email: string, phone: string) {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }

  /**
   * Creates a new order (requisition) for this customer.
   *
   * LIST OPERATION: The returned Order will be added to
   * the requisitionOrders[] list by the StoreSystem.
   *
   * @param id      - Unique order identifier
   * @param product - Product name or description
   * @param price   - Product price
   * @returns A new Order object in REQUISITION_CREATED status
   */
  public createRequisition(id: string, product: string, price: number): Order {
    // Create a new Order with the initial workflow stage
    const order = new Order(
      id,
      this.name,
      product,
      price,
      WorkflowStage.REQUISITION_CREATED
    );
    console.log(
      `[Customer] ${this.name} created requisition for "${product}" (Order ID: ${id})`
    );
    return order;
  }

  /**
   * Returns a string representation of the customer.
   */
  public toString(): string {
    return `${this.name} (${this.email})`;
  }
}
