import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertHzVaccineResponseSchema, type InsertHzVaccineResponse } from "@shared/schema";
import { Syringe, User, History, Heart, Clock, Save, RotateCcw, Download, CheckCircle } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<InsertHzVaccineResponse>({
    resolver: zodResolver(insertHzVaccineResponseSchema),
    defaultValues: {
      sexo: undefined,
      idade: undefined,
      familia_hz: undefined,
      conhece_vacina: undefined,
      aceitou_explicacao: undefined,
      interesse_vacina: undefined,
      interesse_vacinar: undefined,
      vacinou_local: undefined,
      retornar_outro_dia: undefined,
      motivo_nao_vacinar: "",
      periodo: undefined,
      movimento_loja: undefined,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertHzVaccineResponse) => {
      const response = await apiRequest("POST", "/api/hz-vaccine-responses", data);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/hz-vaccine-responses"] });
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar formulário",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/hz-vaccine-responses/export");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dados-vacina-hz.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Dados exportados",
        description: "O arquivo CSV foi baixado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertHzVaccineResponse) => {
    submitMutation.mutate(data);
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      form.reset();
    }
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Syringe className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Formulário de Coleta</h1>
              <p className="text-slate-600 text-sm">Pesquisa sobre Vacina Herpes Zoster (HZ)</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Coleta de Dados - Vacina HZ</h2>
            <p className="text-slate-600">Preencha todos os campos obrigatórios para registrar as informações do cliente.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Seção 1: Informações Básicas */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  <User className="text-primary inline mr-2" />
                  Informações Básicas
                </h3>

                {/* Sexo */}
                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Sexo <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3"
                        >
                          {["F", "M", "Outro", "Prefere não dizer"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`sexo-${option}`} />
                              <label htmlFor={`sexo-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option === "F" ? "Feminino" : option === "M" ? "Masculino" : option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Idade */}
                <FormField
                  control={form.control}
                  name="idade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Idade <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Digite a idade"
                          min={18}
                          max={120}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção 2: Histórico e Conhecimento */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  <History className="text-primary inline mr-2" />
                  Histórico e Conhecimento
                </h3>

                {/* Família teve HZ */}
                <FormField
                  control={form.control}
                  name="familia_hz"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Alguém da família teve Herpes Zoster? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`familia-hz-${option}`} />
                              <label htmlFor={`familia-hz-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conhece vacina */}
                <FormField
                  control={form.control}
                  name="conhece_vacina"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Conhece a vacina contra Herpes Zoster? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`conhece-vacina-${option}`} />
                              <label htmlFor={`conhece-vacina-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Aceitou explicação */}
                <FormField
                  control={form.control}
                  name="aceitou_explicacao"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Aceitou a explicação sobre a vacina? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`aceitou-explicacao-${option}`} />
                              <label htmlFor={`aceitou-explicacao-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção 3: Interesse e Vacinação */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  <Heart className="text-primary inline mr-2" />
                  Interesse e Vacinação
                </h3>

                {/* Interesse vacina */}
                <FormField
                  control={form.control}
                  name="interesse_vacina"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Tem interesse pela vacina HZ? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`interesse-vacina-${option}`} />
                              <label htmlFor={`interesse-vacina-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interesse vacinar */}
                <FormField
                  control={form.control}
                  name="interesse_vacinar"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Tem interesse em se vacinar? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`interesse-vacinar-${option}`} />
                              <label htmlFor={`interesse-vacinar-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vacinou local */}
                <FormField
                  control={form.control}
                  name="vacinou_local"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Cliente se vacinou no local? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`vacinou-local-${option}`} />
                              <label htmlFor={`vacinou-local-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retornar outro dia */}
                <FormField
                  control={form.control}
                  name="retornar_outro_dia"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Cliente irá retornar outro dia? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Sim", "Não"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`retornar-outro-dia-${option}`} />
                              <label htmlFor={`retornar-outro-dia-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Motivo não vacinar */}
                <FormField
                  control={form.control}
                  name="motivo_nao_vacinar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Motivo se não quiser se vacinar (opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o motivo pelo qual o cliente não quer se vacinar..."
                          className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Máximo de 500 caracteres</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção 4: Informações do Atendimento */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  <Clock className="text-primary inline mr-2" />
                  Informações do Atendimento
                </h3>

                {/* Período */}
                <FormField
                  control={form.control}
                  name="periodo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Período do atendimento <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Manhã", "Tarde"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`periodo-${option}`} />
                              <label htmlFor={`periodo-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Movimento loja */}
                <FormField
                  control={form.control}
                  name="movimento_loja"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm font-medium text-slate-700">
                        Movimento da loja <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          {["Movimentada", "Pouco movimento"].map((option) => (
                            <div key={option} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <RadioGroupItem value={option} id={`movimento-loja-${option}`} />
                              <label htmlFor={`movimento-loja-${option}`} className="text-sm text-slate-700 cursor-pointer">
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {submitMutation.isPending ? "Salvando..." : "Salvar Formulário"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar Formulário
                </Button>

                <Button
                  type="button"
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="bg-secondary text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exportMutation.isPending ? "Exportando..." : "Exportar Dados"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Formulário Enviado!</h3>
                <p className="text-slate-600 mb-4">Os dados foram salvos com sucesso.</p>
                <Button onClick={() => setShowSuccess(false)} className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Fechar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
