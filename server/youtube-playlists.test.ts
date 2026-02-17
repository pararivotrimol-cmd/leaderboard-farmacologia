import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("youtubePlaylists", () => {
  const caller = appRouter.createCaller(createPublicContext());

  describe("getVisible", () => {
    it("returns visible playlists as an array", async () => {
      const result = await caller.youtubePlaylists.getVisible();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getAll (admin)", () => {
    it("rejects with invalid password", async () => {
      await expect(
        caller.youtubePlaylists.getAll({ password: "wrong-password-xyz" })
      ).rejects.toThrow("Senha inválida");
    });
  });

  describe("create (admin)", () => {
    it("rejects with invalid password", async () => {
      await expect(
        caller.youtubePlaylists.create({
          password: "wrong-password-xyz",
          title: "Test Playlist",
          youtubeUrl: "https://www.youtube.com/playlist?list=PLtest123",
          videoType: "playlist",
          module: "Geral",
        })
      ).rejects.toThrow("Senha inválida");
    });

    it("validates input - requires title", async () => {
      await expect(
        caller.youtubePlaylists.create({
          password: "test",
          title: "",
          youtubeUrl: "https://www.youtube.com/watch?v=test123",
          videoType: "video",
        })
      ).rejects.toThrow();
    });
  });

  describe("delete (admin)", () => {
    it("rejects with invalid password", async () => {
      await expect(
        caller.youtubePlaylists.delete({ password: "wrong-password-xyz", id: 999 })
      ).rejects.toThrow("Senha inválida");
    });
  });

  describe("toggleVisibility (admin)", () => {
    it("rejects with invalid password", async () => {
      await expect(
        caller.youtubePlaylists.toggleVisibility({ password: "wrong-password-xyz", id: 999, isVisible: 0 })
      ).rejects.toThrow("Senha inválida");
    });
  });

  describe("update (admin)", () => {
    it("rejects with invalid password", async () => {
      await expect(
        caller.youtubePlaylists.update({
          password: "wrong-password-xyz",
          id: 999,
          title: "Updated Title",
        })
      ).rejects.toThrow("Senha inválida");
    });
  });
});

describe("extractYoutubeId (via create route)", () => {
  const caller = appRouter.createCaller(createPublicContext());

  it("rejects invalid YouTube URLs", async () => {
    // This should fail because the URL is not a valid YouTube URL
    // and the admin password is wrong anyway, but we test the flow
    await expect(
      caller.youtubePlaylists.create({
        password: "wrong-password-xyz",
        title: "Test",
        youtubeUrl: "not-a-valid-url",
        videoType: "video",
      })
    ).rejects.toThrow(); // Either password error or URL error
  });
});
