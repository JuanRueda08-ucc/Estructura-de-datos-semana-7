/**
 * ============================================================
 * main.ts - Application Entry Point & UI Controller
 * ============================================================
 *
 * This file connects the OOP backend (StoreSystem) with the
 * HTML frontend. It handles:
 *   - DOM event binding (form submissions, button clicks)
 *   - Rendering all 9 workflow lists into the UI
 *   - Creating new orders and adding them to lists
 *   - Advancing orders through workflow stages
 *   - Searching, updating, and deleting orders
 *
 * HOW LISTS ARE VISUALIZED:
 *   Each of the 9 lists (arrays) is rendered as a separate
 *   column/card in the UI. When an order moves between lists,
 *   the entire UI is re-rendered to reflect the change.
 * ============================================================
 */

import { Order, STAGE_LABELS } from "./Order.ts";
import { Customer } from "./Customer.ts";
import { StoreSystem } from "./StoreSystem.ts";
import "../style.css";

// =========================================================
// GLOBAL INSTANCES
// =========================================================

/** The main store system instance that manages all 9 workflow lists */
const storeSystem = new StoreSystem();

// =========================================================
// UI RENDERING
// =========================================================

/**
 * Color scheme for each workflow stage column.
 * Each stage gets a distinct color for easy visual identification.
 */
const STAGE_COLORS: Record<string, string> = {
  requisitionOrders: "#6366f1",   // Indigo
  quoteRequests: "#8b5cf6",       // Violet
  quoteEvaluation: "#a855f7",     // Purple
  approvedQuotes: "#06b6d4",      // Cyan
  orderPreparation: "#0ea5e9",    // Sky
  orderReview: "#f59e0b",         // Amber
  fulfilledOrders: "#10b981",     // Emerald
  deliveredOrders: "#14b8a6",     // Teal
  paymentCompleted: "#22c55e",    // Green
};

/**
 * Icons (emoji) for each workflow stage.
 */
const STAGE_ICONS: Record<string, string> = {
  requisitionOrders: "📋",
  quoteRequests: "📝",
  quoteEvaluation: "🔍",
  approvedQuotes: "✅",
  orderPreparation: "🔧",
  orderReview: "📑",
  fulfilledOrders: "📦",
  deliveredOrders: "🚚",
  paymentCompleted: "💰",
};

/**
 * Next-stage action label for the advance button.
 */
const ADVANCE_LABELS: Record<string, string> = {
  requisitionOrders: "Request Quote →",
  quoteRequests: "Evaluate Quote →",
  quoteEvaluation: "Approve Quote →",
  approvedQuotes: "Prepare Order →",
  orderPreparation: "Review Order →",
  orderReview: "Fulfill Order →",
  fulfilledOrders: "Deliver →",
  deliveredOrders: "Complete Payment →",
  paymentCompleted: "",
};

/**
 * Renders ALL 9 workflow lists into the DOM.
 *
 * This function iterates over the lists from StoreSystem
 * and creates HTML elements for each order in each list.
 *
 * LIST VISUALIZATION:
 *   Each list (array) becomes a column card in the UI.
 *   The number of items in each list is shown in the header badge.
 *   Each order card shows its ID, product, price, and status.
 */
function renderAllLists(): void {
  const container = document.getElementById("lists-container");
  if (!container) return;

  // Get all lists from the StoreSystem
  const listsMap = storeSystem.getListsMap();

  // Clear the container
  container.innerHTML = "";

  // Render each list as a column
  listsMap.forEach(({ name, key, list }) => {
    const color = STAGE_COLORS[key] || "#6366f1";
    const icon = STAGE_ICONS[key] || "📋";

    // Create the column element
    const column = document.createElement("div");
    column.className = "workflow-column";
    column.style.setProperty("--column-color", color);

    // Column header with list name and count badge
    column.innerHTML = `
      <div class="column-header">
        <span class="column-icon">${icon}</span>
        <h3 class="column-title">${name}</h3>
        <span class="column-badge">${list.length}</span>
      </div>
      <div class="column-body" id="list-${key}"></div>
    `;

    container.appendChild(column);

    // Render each order in this list
    const listBody = column.querySelector(`#list-${key}`) as HTMLElement;

    if (list.length === 0) {
      listBody.innerHTML = '<div class="empty-list">No orders</div>';
    } else {
      // Iterate over the list (array) and create a card for each order
      list.forEach((order: Order) => {
        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
          <div class="order-header">
            <span class="order-id">${order.id}</span>
            <span class="order-status">${STAGE_LABELS[order.status]}</span>
          </div>
          <div class="order-details">
            <div class="order-detail"><strong>Customer:</strong> ${order.customerName}</div>
            <div class="order-detail"><strong>Product:</strong> ${order.product}</div>
            <div class="order-detail"><strong>Price:</strong> $${order.price.toFixed(2)}</div>
          </div>
          <div class="order-actions">
            ${
              key !== "paymentCompleted"
                ? `<button class="btn btn-advance" data-order-id="${order.id}" data-action="advance">${ADVANCE_LABELS[key]}</button>`
                : '<span class="completed-badge">✓ Completed</span>'
            }
            <button class="btn btn-delete" data-order-id="${order.id}" data-action="delete">✕</button>
          </div>
        `;
        listBody.appendChild(card);
      });
    }
  });

  // Update the total orders counter
  updateStats();

  // Bind action buttons
  bindOrderActions();
}

/**
 * Updates the statistics panel with current list sizes.
 */
function updateStats(): void {
  const totalEl = document.getElementById("stat-total");
  const inProgressEl = document.getElementById("stat-in-progress");
  const completedEl = document.getElementById("stat-completed");

  const total = storeSystem.getTotalOrders();
  const completed = storeSystem.paymentCompleted.length;
  const inProgress = total - completed;

  if (totalEl) totalEl.textContent = String(total);
  if (inProgressEl) inProgressEl.textContent = String(inProgress);
  if (completedEl) completedEl.textContent = String(completed);
}

/**
 * Binds click event handlers to all order action buttons.
 */
function bindOrderActions(): void {
  // Advance buttons - move order to next stage
  document.querySelectorAll('[data-action="advance"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const orderId = (e.target as HTMLElement).getAttribute("data-order-id");
      if (orderId) {
        storeSystem.advanceOrder(orderId);
        renderAllLists();
        showNotification(`Order ${orderId} advanced to next stage`, "success");
      }
    });
  });

  // Delete buttons - remove order from system
  document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const orderId = (e.target as HTMLElement).getAttribute("data-order-id");
      if (orderId) {
        storeSystem.deleteOrder(orderId);
        renderAllLists();
        showNotification(`Order ${orderId} deleted`, "error");
      }
    });
  });
}

// =========================================================
// FORM HANDLING
// =========================================================

/**
 * Handles the create order form submission.
 *
 * LIST OPERATION: Creates a new Order object and adds it
 * to the requisitionOrders[] list via StoreSystem.addOrder().
 */
function handleCreateOrder(e: Event): void {
  e.preventDefault();

  const nameInput = document.getElementById(
    "input-customer"
  ) as HTMLInputElement;
  const productInput = document.getElementById(
    "input-product"
  ) as HTMLInputElement;
  const priceInput = document.getElementById("input-price") as HTMLInputElement;

  const customerName = nameInput.value.trim();
  const product = productInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!customerName || !product || isNaN(price) || price <= 0) {
    showNotification("Please fill in all fields correctly", "error");
    return;
  }

  // Generate a unique ID
  const orderId = storeSystem.generateOrderId();

  // Create the order using the Customer class
  const customer = new Customer(customerName, "", "");
  const order = customer.createRequisition(orderId, product, price);

  // Add the order to the requisitionOrders[] list
  storeSystem.addOrder(order);

  // Re-render all lists to show the new order
  renderAllLists();

  // Clear the form
  nameInput.value = "";
  productInput.value = "";
  priceInput.value = "";

  showNotification(`Order ${orderId} created successfully!`, "success");
}

/**
 * Handles the search order form submission.
 */
function handleSearchOrder(e: Event): void {
  e.preventDefault();

  const searchInput = document.getElementById(
    "input-search"
  ) as HTMLInputElement;
  const searchId = searchInput.value.trim();

  if (!searchId) {
    showNotification("Please enter an order ID to search", "error");
    return;
  }

  const order = storeSystem.searchOrder(searchId);
  const resultPanel = document.getElementById("search-result");

  if (order && resultPanel) {
    resultPanel.innerHTML = `
      <div class="search-found">
        <h4>Order Found</h4>
        <div class="order-detail"><strong>ID:</strong> ${order.id}</div>
        <div class="order-detail"><strong>Customer:</strong> ${order.customerName}</div>
        <div class="order-detail"><strong>Product:</strong> ${order.product}</div>
        <div class="order-detail"><strong>Price:</strong> $${order.price.toFixed(2)}</div>
        <div class="order-detail"><strong>Status:</strong> ${STAGE_LABELS[order.status]}</div>
      </div>
    `;
    resultPanel.classList.remove("hidden");
  } else if (resultPanel) {
    resultPanel.innerHTML = `
      <div class="search-not-found">
        <p>❌ Order "${searchId}" not found in any list</p>
      </div>
    `;
    resultPanel.classList.remove("hidden");
  }
}

// =========================================================
// NOTIFICATION SYSTEM
// =========================================================

/**
 * Shows a temporary notification message.
 */
function showNotification(
  message: string,
  type: "success" | "error" = "success"
): void {
  const container = document.getElementById("notifications");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("notification-fade");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// =========================================================
// DEMO DATA
// =========================================================

/**
 * Adds sample orders to demonstrate the system.
 * Orders are placed at different stages to show how
 * the 9 lists work simultaneously.
 */
function loadDemoData(): void {
  // Create several sample orders
  const sampleOrders = [
    { name: "Alice Johnson", product: "Laptop Dell XPS 15", price: 1299.99 },
    { name: "Bob Smith", product: "Monitor LG 27\"", price: 449.99 },
    { name: "Charlie Brown", product: "Keyboard Mechanical RGB", price: 89.99 },
    { name: "Diana Ross", product: "Mouse Wireless Pro", price: 59.99 },
    { name: "Edward Norton", product: "USB-C Hub 7-in-1", price: 39.99 },
    { name: "Fiona Apple", product: "Webcam HD 1080p", price: 79.99 },
  ];

  // Add orders to the system - they all start in requisitionOrders[]
  sampleOrders.forEach(({ name, product, price }) => {
    const id = storeSystem.generateOrderId();
    const customer = new Customer(name, "", "");
    const order = customer.createRequisition(id, product, price);
    storeSystem.addOrder(order);
  });

  // Advance some orders to show them in different lists
  // This demonstrates how orders move through the workflow

  // Move ORD-0001 through several stages
  storeSystem.advanceOrder("ORD-0001"); // → quoteRequests
  storeSystem.advanceOrder("ORD-0001"); // → quoteEvaluation
  storeSystem.advanceOrder("ORD-0001"); // → approvedQuotes

  // Move ORD-0002 through a few stages
  storeSystem.advanceOrder("ORD-0002"); // → quoteRequests

  // Move ORD-0003 through many stages
  storeSystem.advanceOrder("ORD-0003"); // → quoteRequests
  storeSystem.advanceOrder("ORD-0003"); // → quoteEvaluation
  storeSystem.advanceOrder("ORD-0003"); // → approvedQuotes
  storeSystem.advanceOrder("ORD-0003"); // → orderPreparation
  storeSystem.advanceOrder("ORD-0003"); // → orderReview
  storeSystem.advanceOrder("ORD-0003"); // → fulfilledOrders

  // ORD-0004, ORD-0005, ORD-0006 stay in requisitionOrders[]

  renderAllLists();
  showNotification("Demo data loaded — 6 orders across different stages", "success");
}

// =========================================================
// INITIALIZATION
// =========================================================

/**
 * Initializes the application when the DOM is ready.
 */
function init(): void {
  console.log("===========================================");
  console.log("  Store Order Management Workflow System");
  console.log("  Lists (Arrays) Workshop - TypeScript");
  console.log("===========================================");

  // Bind the create order form
  const createForm = document.getElementById("create-order-form");
  if (createForm) {
    createForm.addEventListener("submit", handleCreateOrder);
  }

  // Bind the search form
  const searchForm = document.getElementById("search-order-form");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchOrder);
  }

  // Bind the demo data button
  const demoBtn = document.getElementById("btn-demo-data");
  if (demoBtn) {
    demoBtn.addEventListener("click", loadDemoData);
  }

  // Initial render of all (empty) lists
  renderAllLists();
}

// Start the application
document.addEventListener("DOMContentLoaded", init);
