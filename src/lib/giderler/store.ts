import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CategoryId, UserId } from "./categories.ts";

export type Expense = {
  id: string;
  owner: UserId;
  /** YYYY-MM-DD */
  date: string;
  /** kuruş */
  amount: number;
  category: CategoryId;
  note?: string;
  createdAt: string;
};

export type ExpenseInput = Pick<Expense, "date" | "amount" | "category" | "note">;

type FileShape = { version: 1; expenses: Expense[] };

const NOTE_MAX = 200;

function clean(input: ExpenseInput): ExpenseInput {
  const note = input.note?.trim().slice(0, NOTE_MAX);
  return { date: input.date, amount: input.amount, category: input.category, ...(note ? { note } : {}) };
}

export function createStore(dir: string) {
  const file = path.join(dir, "expenses.json");
  // every read-modify-write runs one after another, so concurrent saves can't drop each other
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.then(fn);
    queue = run.catch(() => {});
    return run;
  };

  async function read(): Promise<Expense[]> {
    try {
      return (JSON.parse(await readFile(file, "utf8")) as FileShape).expenses;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  async function write(expenses: Expense[]): Promise<void> {
    await mkdir(dir, { recursive: true });
    const tmp = `${file}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify({ version: 1, expenses } satisfies FileShape, null, 2));
    await rename(tmp, file);
  }

  async function mutate(owner: UserId, id: string, change: (list: Expense[], index: number) => void): Promise<boolean> {
    return serial(async () => {
      const list = await read();
      const index = list.findIndex((e) => e.id === id);
      if (index === -1 || list[index].owner !== owner) return false;
      change(list, index);
      await write(list);
      return true;
    });
  }

  return {
    list: () => serial(read),

    add: (owner: UserId, input: ExpenseInput) =>
      serial(async () => {
        const expense: Expense = { id: randomUUID(), owner, ...clean(input), createdAt: new Date().toISOString() };
        await write([...(await read()), expense]);
        return expense;
      }),

    update: (owner: UserId, id: string, input: ExpenseInput) =>
      mutate(owner, id, (list, i) => {
        const { id: keepId, owner: keepOwner, createdAt } = list[i];
        list[i] = { id: keepId, owner: keepOwner, ...clean(input), createdAt };
      }),

    remove: (owner: UserId, id: string) => mutate(owner, id, (list, i) => void list.splice(i, 1)),
  };
}

export type Store = ReturnType<typeof createStore>;

const globalStores = globalThis as typeof globalThis & { __giderlerStore?: Store };

/** One store (and one write queue) per process, surviving dev-server module reloads. */
export function getStore(): Store {
  return (globalStores.__giderlerStore ??= createStore(process.env.GIDER_DATA_DIR ?? "./data"));
}
