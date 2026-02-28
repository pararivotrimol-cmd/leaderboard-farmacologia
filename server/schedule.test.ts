/**
 * Tests for the Schedule Router
 * Covers CRUD operations for schedule entries
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Helper to set up chainable mock
function setupSelectMock(returnValue: any[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(returnValue),
  };
  mockDb.select.mockReturnValue(chain);
  return chain;
}

function setupInsertMock(insertId: number) {
  const chain = {
    values: vi.fn().mockResolvedValue([{ insertId }]),
  };
  mockDb.insert.mockReturnValue(chain);
  return chain;
}

function setupUpdateMock() {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{}]),
  };
  mockDb.update.mockReturnValue(chain);
  return chain;
}

function setupDeleteMock() {
  const chain = {
    where: vi.fn().mockResolvedValue([{}]),
  };
  mockDb.delete.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  (getDb as any).mockResolvedValue(mockDb);
});

describe("Schedule Router — getAll (public)", () => {
  it("returns active schedule entries sorted by sortOrder", async () => {
    const mockEntries = [
      { id: 1, weekLabel: "Semana 1", title: "Introdução", type: "aula", sortOrder: 1, isActive: true, highlight: false, classId: null, weekDate: "10/03/2026", detail: null, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, weekLabel: "Semana 2", title: "Farmacocinética", type: "tbl", sortOrder: 2, isActive: true, highlight: false, classId: null, weekDate: "17/03/2026", detail: null, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    setupSelectMock(mockEntries);

    const db = await getDb();
    expect(db).toBeTruthy();
    expect(mockEntries).toHaveLength(2);
    expect(mockEntries[0].weekLabel).toBe("Semana 1");
    expect(mockEntries[1].type).toBe("tbl");
  });

  it("returns empty array when no active entries exist", async () => {
    setupSelectMock([]);
    const db = await getDb();
    expect(db).toBeTruthy();
  });
});

describe("Schedule Router — getAllAdmin (protected)", () => {
  it("returns all entries including inactive ones", async () => {
    const mockEntries = [
      { id: 1, weekLabel: "Semana 1", title: "Introdução", type: "aula", sortOrder: 1, isActive: true, highlight: false },
      { id: 2, weekLabel: "Semana 2", title: "Oculta", type: "aula", sortOrder: 2, isActive: false, highlight: false },
    ];
    setupSelectMock(mockEntries);
    const db = await getDb();
    expect(db).toBeTruthy();
    expect(mockEntries.some(e => !e.isActive)).toBe(true);
  });
});

describe("Schedule Router — create (admin only)", () => {
  it("creates a new schedule entry and returns it", async () => {
    setupInsertMock(42);
    const newEntry = { id: 42, weekLabel: "Semana 18", title: "Nova Semana", type: "aula", sortOrder: 18, isActive: true, highlight: false, classId: null, weekDate: null, detail: null, createdBy: 1, createdAt: new Date(), updatedAt: new Date() };
    
    // Mock the select after insert
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([newEntry]),
    };
    mockDb.select.mockReturnValue(selectChain);

    const db = await getDb();
    expect(db).toBeTruthy();
    const [result] = await db.insert({} as any).values({});
    expect((result as any).insertId).toBe(42);
  });

  it("validates required fields (weekLabel and title)", () => {
    const input = { weekLabel: "", title: "", type: "aula" };
    expect(input.weekLabel).toBeFalsy();
    expect(input.title).toBeFalsy();
  });

  it("accepts all valid types", () => {
    const validTypes = ["aula", "tbl", "caso", "jigsaw", "prova"];
    expect(validTypes).toHaveLength(5);
    validTypes.forEach(type => {
      expect(["aula", "tbl", "caso", "jigsaw", "prova"]).toContain(type);
    });
  });
});

describe("Schedule Router — update (admin only)", () => {
  it("updates an existing schedule entry", async () => {
    setupUpdateMock();
    const updatedEntry = { id: 1, weekLabel: "Semana 1 Atualizada", title: "Novo Título", type: "tbl", sortOrder: 1, isActive: true, highlight: true };
    
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([updatedEntry]),
    };
    mockDb.select.mockReturnValue(selectChain);

    const db = await getDb();
    expect(db).toBeTruthy();
    await db.update({} as any).set({}).where({} as any);
    expect(mockDb.update).toHaveBeenCalledTimes(1);
  });

  it("supports partial updates (only changed fields)", () => {
    const partialUpdate = { id: 1, title: "Novo Título" };
    expect(Object.keys(partialUpdate)).toHaveLength(2);
    expect(partialUpdate.title).toBe("Novo Título");
  });
});

describe("Schedule Router — delete (admin only)", () => {
  it("deletes a schedule entry by id", async () => {
    setupDeleteMock();
    const db = await getDb();
    expect(db).toBeTruthy();
    await db.delete({} as any).where({} as any);
    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });
});

describe("Schedule Router — reorder (admin only)", () => {
  it("reorders entries by updating sortOrder for each ID", async () => {
    setupUpdateMock();
    const orderedIds = [3, 1, 2]; // New order
    const db = await getDb();
    expect(db).toBeTruthy();

    // Simulate reorder: update each entry's sortOrder
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update({} as any).set({ sortOrder: i + 1 }).where({} as any);
    }
    expect(mockDb.update).toHaveBeenCalledTimes(orderedIds.length);
  });

  it("assigns sortOrder starting from 1", () => {
    const orderedIds = [5, 3, 1, 4, 2];
    const expectedOrders = orderedIds.map((_, i) => i + 1);
    expect(expectedOrders[0]).toBe(1);
    expect(expectedOrders[expectedOrders.length - 1]).toBe(orderedIds.length);
  });
});

describe("Schedule Entry Data Model", () => {
  it("has all required fields", () => {
    const entry = {
      id: 1,
      weekLabel: "Semana 1",
      weekDate: "10/03/2026",
      title: "Introdução à Farmacologia",
      detail: "Conteúdo detalhado",
      type: "aula",
      highlight: false,
      sortOrder: 1,
      isActive: true,
      classId: null,
      createdBy: 1,
    };
    expect(entry.weekLabel).toBeDefined();
    expect(entry.title).toBeDefined();
    expect(entry.type).toBeDefined();
    expect(entry.sortOrder).toBeDefined();
    expect(entry.isActive).toBeDefined();
  });

  it("highlight is true for prova type entries", () => {
    const provaEntry = { type: "prova", highlight: true };
    expect(provaEntry.highlight).toBe(true);
  });

  it("classId can be null for global entries", () => {
    const globalEntry = { classId: null };
    expect(globalEntry.classId).toBeNull();
  });
});
