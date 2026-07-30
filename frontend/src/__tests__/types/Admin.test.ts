
// Imports
import { describe, it, expect } from "vitest";
import { deriveUserStatus } from "../../types/admin";
import type { AdminUser } from "../../types/admin";

// helper function
function used(
  overrides: Partial<Pick<AdminUser, "enabled" | "user_status">>,
): Pick<AdminUser, "enabled" | "user_status"> {
  return { enabled: true, user_status: "CONFIRMED", ...overrides };
}

// Tests
describe("deriveUserStatus", () => {
  it("returns 'Disabled' when the user is not enabled, regardless of user_status", () => {
    expect(deriveUserStatus(used({ enabled: false, user_status: "CONFIRMED" }))).toBe(
      "Disabled",
    );
    expect(
      deriveUserStatus(used({ enabled: false, user_status: "FORCE_CHANGE_PASSWORD" })),
    ).toBe("Disabled");
  });
 
  it("returns 'Active' when enabled and user_status is CONFIRMED", () => {
    expect(deriveUserStatus(used({ enabled: true, user_status: "CONFIRMED" }))).toBe(
      "Active",
    );
  });
 
  it.each(
    [
    "UNCONFIRMED",
    "FORCE_CHANGE_PASSWORD",
    "RESET_REQUIRED",
    "ARCHIVED",
    "COMPROMISED",
    "EXTERNAL_PROVIDER",
    ] as const)(
    "returns 'Pending' when enabled and user_status is %s",
    (status) => {
      expect(deriveUserStatus(used({ enabled: true, user_status: status }))).toBe(
        "Pending",
      );
    },
  );
});