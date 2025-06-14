import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hzVaccineResponses = pgTable("hz_vaccine_responses", {
  id: serial("id").primaryKey(),
  sexo: text("sexo").notNull(),
  idade: integer("idade").notNull(),
  familia_hz: text("familia_hz").notNull(),
  conhece_vacina: text("conhece_vacina").notNull(),
  aceitou_explicacao: text("aceitou_explicacao").notNull(),
  interesse_vacina: text("interesse_vacina").notNull(),
  interesse_vacinar: text("interesse_vacinar").notNull(),
  vacinou_local: text("vacinou_local").notNull(),
  retornar_outro_dia: text("retornar_outro_dia").notNull(),
  motivo_nao_vacinar: text("motivo_nao_vacinar"),
  periodo: text("periodo").notNull(),
  movimento_loja: text("movimento_loja").notNull(),
});

export const insertHzVaccineResponseSchema = createInsertSchema(hzVaccineResponses)
  .omit({ id: true })
  .extend({
    sexo: z.enum(["F", "M", "Outro", "Prefere não dizer"]),
    idade: z.number().min(18, "Idade deve ser no mínimo 18 anos").max(120, "Idade deve ser no máximo 120 anos"),
    familia_hz: z.enum(["Sim", "Não"]),
    conhece_vacina: z.enum(["Sim", "Não"]),
    aceitou_explicacao: z.enum(["Sim", "Não"]),
    interesse_vacina: z.enum(["Sim", "Não"]),
    interesse_vacinar: z.enum(["Sim", "Não"]),
    vacinou_local: z.enum(["Sim", "Não"]),
    retornar_outro_dia: z.enum(["Sim", "Não"]),
    motivo_nao_vacinar: z.string().max(500, "Motivo deve ter no máximo 500 caracteres").optional(),
    periodo: z.enum(["Manhã", "Tarde"]),
    movimento_loja: z.enum(["Movimentada", "Pouco movimento"]),
  });

export type InsertHzVaccineResponse = z.infer<typeof insertHzVaccineResponseSchema>;
export type HzVaccineResponse = typeof hzVaccineResponses.$inferSelect;
