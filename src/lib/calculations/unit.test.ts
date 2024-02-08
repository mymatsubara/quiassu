import { convertStress, convertToque } from "$lib/calculations/units";
import { describe, expect, it } from "vitest";

describe("units", () => {
    it("should convert stress correctly", () => {
        expect(convertStress(30, "MPa", "KN/cm2")).toBe(3);
        expect(convertStress(3, "KN/cm2", "MPa")).toBe(30);
    })

    it("should convert torque correctly", () => {
        expect(convertToque(1, "Nm", "Ncm")).toBe(100);
        expect(convertToque(100, "Ncm", "Nm")).toBe(1);
    })
})