import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateTesteIAPdf } from "@/lib/teste-ia-pdf";

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  finalidade: string;
  concluido: boolean;
  score_geral: number | null;
  score_basico: number | null;
  score_intermediario: number | null;
  score_avancado: number | null;
  nivel_maturidade: string | null;
  created_at: string;
  competencias: Record<string, number> | null;
}

export function AdminLeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("ia_maturity_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (lead: Lead) => {
    if (!lead.concluido || lead.score_geral == null) {
      toast.error("Lead ainda não concluiu o teste.");
      return;
    }
    setDownloadingId(lead.id);
    try {
      const { data: recs, error } = await supabase
        .from("ia_maturity_recommendations")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      generateTesteIAPdf(lead as any, (recs || []) as any);
      toast.success("Relatório baixado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar relatório");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const { error } = await supabase
        .from("ia_maturity_leads")
        .delete()
        .eq("id", leadToDelete.id);
      if (error) throw error;
      toast.success("Lead excluído");
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir lead");
    } finally {
      setLeadToDelete(null);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Nome",
        "Email",
        "WhatsApp",
        "Finalidade",
        "Concluído",
        "Score Geral",
        "Nível",
        "Data",
      ];

      const rows = leads.map((lead) => [
        lead.nome,
        lead.email,
        lead.whatsapp,
        lead.finalidade === "PF" ? "Pessoa Física" : "Pessoa Jurídica",
        lead.concluido ? "Sim" : "Não",
        lead.score_geral?.toFixed(1) || "-",
        lead.nivel_maturidade || "-",
        format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `leads-teste-ia-${format(new Date(), "dd-MM-yyyy")}.csv`;
      link.click();

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Carregando leads...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Leads do Teste de Maturidade em IA</CardTitle>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhum lead cadastrado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.whatsapp}</TableCell>
                      <TableCell>
                        <Badge variant={lead.finalidade === "PF" ? "secondary" : "default"}>
                          {lead.finalidade === "PF" ? "PF" : "PJ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.concluido ? "default" : "outline"}>
                          {lead.concluido ? "Concluído" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.score_geral ? (
                          <span className="font-semibold">{lead.score_geral.toFixed(1)}/5.0</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.nivel_maturidade ? (
                          <Badge
                            variant={
                              lead.nivel_maturidade === "Avançado"
                                ? "default"
                                : lead.nivel_maturidade === "Em evolução"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {lead.nivel_maturidade}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Baixar relatório PDF"
                            disabled={!lead.concluido || downloadingId === lead.id}
                            onClick={() => handleDownloadReport(lead)}
                          >
                            <FileDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Abrir WhatsApp"
                            onClick={() => {
                              const url = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir lead"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setLeadToDelete(lead)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {leads.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {leads.length} leads • Concluídos: {leads.filter((l) => l.concluido).length} • Pendentes:{" "}
              {leads.filter((l) => !l.concluido).length}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {leadToDelete && (
                <>
                  Esta ação removerá permanentemente o lead <strong>{leadToDelete.nome}</strong> ({leadToDelete.email}) e seu resultado do teste. Não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
