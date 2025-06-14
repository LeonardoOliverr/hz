import { hzVaccineResponses, type HzVaccineResponse, type InsertHzVaccineResponse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getHzVaccineResponse(id: number): Promise<HzVaccineResponse | undefined>;
  getAllHzVaccineResponses(): Promise<HzVaccineResponse[]>;
  createHzVaccineResponse(response: InsertHzVaccineResponse): Promise<HzVaccineResponse>;
}

export class DatabaseStorage implements IStorage {
  async getHzVaccineResponse(id: number): Promise<HzVaccineResponse | undefined> {
    const [response] = await db.select().from(hzVaccineResponses).where(eq(hzVaccineResponses.id, id));
    return response || undefined;
  }

  async getAllHzVaccineResponses(): Promise<HzVaccineResponse[]> {
    return await db.select().from(hzVaccineResponses);
  }

  async createHzVaccineResponse(insertResponse: InsertHzVaccineResponse): Promise<HzVaccineResponse> {
    const [response] = await db
      .insert(hzVaccineResponses)
      .values(insertResponse)
      .returning();
    return response;
  }
}

export const storage = new DatabaseStorage();
