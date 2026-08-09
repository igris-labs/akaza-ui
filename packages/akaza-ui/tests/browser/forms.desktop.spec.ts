import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("form exposes native validation, FormData, disabled fieldsets, server errors, and reset", async ({ page }) => {
  const formSection = section(page, "form");
  const form = formSection.locator("form.akaza-form");
  const email = form.getByRole("textbox", { name: "Email" });
  const company = form.getByRole("textbox", { name: "Company" });
  const submit = form.getByRole("button", { name: "Create account" });
  const output = form.locator("pre");

  await submit.click();
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("data-akaza-invalid", "true");
  const emailField = email.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' akaza-field ')][1]");
  await expect(emailField.locator(".akaza-field-error")).not.toBeEmpty();
  await expect(form).toHaveAttribute("data-akaza-state", "invalid");

  await email.fill("ops@example.com");
  await company.fill("Akaza Labs");
  await submit.click();
  await expect(output).toContainText('"email": "ops@example.com"');
  await expect(output).toContainText('"company": "Akaza Labs"');
  await expect(output).not.toContainText("billingCode");

  const billingFieldset = form.getByRole("group", { name: "Billing metadata" });
  const billingInput = form.getByRole("textbox", { name: "Billing code" });
  await expect(billingFieldset).toHaveAttribute("disabled", "");
  await expect(billingInput).toBeDisabled();
  await form.getByRole("button", { name: "Enable billing fieldset" }).click();
  await expect(billingInput).toBeEnabled();
  await submit.click();
  await expect(output).toContainText('"billingCode": "INV-42"');

  await email.fill("taken@example.com");
  await submit.click();
  await expect(form.getByText("Email is already taken.")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");

  await form.getByRole("button", { name: "Reset" }).click();
  await expect(email).toHaveValue("");
  await expect(form).toHaveAttribute("data-akaza-state", "idle");
  await expect(output).toContainText("Form reset.");
});

test("disabled fieldset propagates to every nested native control", async ({ page }) => {
  const fieldsetSection = section(page, "fieldset");
  await fieldsetSection.getByRole("button", { name: "Disable shipping fields" }).click();
  const shipping = fieldsetSection.locator("fieldset.akaza-fieldset").filter({ hasText: "Shipping details" });
  await expect(shipping).toHaveAttribute("disabled", "");
  await expect(shipping.getByRole("textbox", { name: "Address" })).toBeDisabled();
  await expect(shipping.getByRole("textbox", { name: "City" })).toBeDisabled();
});
