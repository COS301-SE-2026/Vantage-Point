import { describe, expect, it } from "vitest";
import { parseRiotId } from "./riotId";

describe("parseRiotId", () => {
  it("splits name and tag on the last hash", () => {
    expect(parseRiotId("TheFast#4444")).toEqual({
      gameName: "TheFast",
      tagLine: "4444",
    });
  });

  it("strips a leading hash from the tag", () => {
    expect(parseRiotId("6lordz#1072")).toEqual({
      gameName: "6lordz",
      tagLine: "1072",
    });
  });

  it("rejects ids without a tag", () => {
    expect(() => parseRiotId("NoTagHere")).toThrow();
  });
});
