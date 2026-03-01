import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonCollection<T extends { id: number | string }> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(name: string) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", "utf-8");
    }
  }

  private read(): T[] {
    if (this.cache) return this.cache;
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      this.cache = JSON.parse(data) as T[];
      return this.cache;
    } catch {
      this.cache = [];
      return [];
    }
  }

  private write(data: T[]): void {
    this.cache = data;
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  getAll(): T[] {
    return [...this.read()];
  }

  getById(id: number | string): T | undefined {
    return this.read().find((item) => item.id === id);
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.read().filter(predicate);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.read().find(predicate);
  }

  insert(item: T): T {
    const data = this.read();
    data.push(item);
    this.write(data);
    return item;
  }

  update(id: number | string, updates: Partial<T>): T | undefined {
    const data = this.read();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    data[index] = { ...data[index], ...updates };
    this.write(data);
    return data[index];
  }

  delete(id: number | string): void {
    const data = this.read().filter((item) => item.id !== id);
    this.write(data);
  }

  deleteWhere(predicate: (item: T) => boolean): void {
    const data = this.read().filter((item) => !predicate(item));
    this.write(data);
  }

  updateWhere(predicate: (item: T) => boolean, updates: Partial<T>): void {
    const data = this.read();
    for (let i = 0; i < data.length; i++) {
      if (predicate(data[i])) {
        data[i] = { ...data[i], ...updates };
      }
    }
    this.write(data);
  }

  nextId(): number {
    const data = this.read();
    if (data.length === 0) return 1;
    const maxId = Math.max(...data.map((item) => (typeof item.id === "number" ? item.id : 0)));
    return maxId + 1;
  }

  count(predicate?: (item: T) => boolean): number {
    if (!predicate) return this.read().length;
    return this.read().filter(predicate).length;
  }

  clear(): void {
    this.write([]);
  }
}
