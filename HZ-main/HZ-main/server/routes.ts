import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHzVaccineResponseSchema } from "@shared/schema";
import { z } from "zod";
import { initializeGoogleSheets, getGoogleSheetsService } from "./googleSheets";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Google Sheets integration
  const googleSheets = initializeGoogleSheets();
  if (googleSheets) {
    try {
      await googleSheets.initializeSheet();
      console.log('Google Sheets integration initialized successfully');
    } catch (error) {
      console.warn('Google Sheets initialization failed:', error);
    }
  }

  // Get all HZ vaccine responses
  app.get("/api/hz-vaccine-responses", async (req, res) => {
    try {
      const responses = await storage.getAllHzVaccineResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create new HZ vaccine response
  app.post("/api/hz-vaccine-responses", async (req, res) => {
    try {
      const validatedData = insertHzVaccineResponseSchema.parse(req.body);
      const response = await storage.createHzVaccineResponse(validatedData);
      
      // Sync with Google Sheets if available
      const sheetsService = getGoogleSheetsService();
      if (sheetsService) {
        try {
          await sheetsService.addResponse(response);
        } catch (sheetsError) {
          console.error('Failed to sync with Google Sheets:', sheetsError);
          // Continue without failing the main request
        }
      }
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Export HZ vaccine responses as CSV
  app.get("/api/hz-vaccine-responses/export", async (req, res) => {
    try {
      const responses = await storage.getAllHzVaccineResponses();
      
      if (responses.length === 0) {
        res.status(404).json({ message: "Nenhum dado encontrado para exportar" });
        return;
      }

      // CSV headers in Portuguese
      const headers = [
        "ID",
        "Sexo",
        "Idade", 
        "Família teve HZ",
        "Conhece vacina",
        "Aceitou explicação",
        "Interesse vacina",
        "Interesse vacinar",
        "Vacinou local",
        "Retornar outro dia",
        "Motivo não vacinar",
        "Período",
        "Movimento loja"
      ];

      // Convert responses to CSV format
      const csvData = responses.map(response => [
        response.id,
        response.sexo,
        response.idade,
        response.familia_hz,
        response.conhece_vacina,
        response.aceitou_explicacao,
        response.interesse_vacina,
        response.interesse_vacinar,
        response.vacinou_local,
        response.retornar_outro_dia,
        response.motivo_nao_vacinar || "",
        response.periodo,
        response.movimento_loja
      ].map(field => `"${field}"`).join(","));

      const csv = [headers.join(","), ...csvData].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=dados-vacina-hz.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Erro ao exportar dados" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
