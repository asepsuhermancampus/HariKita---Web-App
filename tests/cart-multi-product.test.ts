import { test } from "node:test";
import assert from "node:assert/strict";
import { cartStore } from "../src/lib/cart-store";

const base = {
  categoryId: "katering",
  categoryTitle: "Katering Prasmanan & Stall",
  vendorId: "v_katering_001",
  vendorName: "Dapur Bahagia",
  district: "Kebumen Kota",
  unitPrice: 35000,
  callTime: "09:00 WIB",
  unitLabel: "per pax",
};

test("adding two different products from same vendor yields two rows", () => {
  cartStore.clearCart();
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 300 });
  cartStore.addItem({ ...base, packageId: "prod_stall_sate", packageName: "Stall Sate", quantity: 300 });
  const items = cartStore.getSnapshot().items;
  assert.equal(items.length, 2);
});

test("adding the same product twice upserts quantity", () => {
  cartStore.clearCart();
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 100 });
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 200 });
  const items = cartStore.getSnapshot().items;
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 300);
});

test("same product id under different vendors yields two rows", () => {
  cartStore.clearCart();
  cartStore.addItem({ ...base, packageId: "prod_stall_bakso", packageName: "Stall Bakso", quantity: 100 });
  cartStore.addItem({
    ...base,
    vendorId: "v_katering_002",
    vendorName: "Dapur Nusantara",
    packageId: "prod_stall_bakso",
    packageName: "Stall Bakso",
    quantity: 100,
  });
  assert.equal(cartStore.getSnapshot().items.length, 2);
});

test("unitLabel and productSlug are persisted on the item", () => {
  cartStore.clearCart();
  cartStore.addItem({
    ...base,
    packageId: "prod_stall_bakso",
    packageName: "Stall Bakso",
    quantity: 300,
    productSlug: "stall-bakso",
  });
  const item = cartStore.getSnapshot().items[0];
  assert.equal(item.unitLabel, "per pax");
  assert.equal(item.productSlug, "stall-bakso");
});
