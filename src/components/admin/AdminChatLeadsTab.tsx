import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Phone, User, Calendar, TrendingUp, Trash2, Download, Filter } from 'lucide-react';
import { useChatLeads } from '@/hooks/useChatLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16'];

const AdminChatLeadsTab = () => {
  const { data: leads, isLoading, refetch } = useChatLeads();
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // Calcular interesses únicos (1 por usuário, mesmo que mencionado várias vezes)
  const uniqueInterestsByUser = useMemo(() => {
    const interestMap: Record<string, Set<string>> = {};
    
    leads?.forEach(lead => {
      const uniqueInterests = [...new Set(lead.interesses.map(i => i.toLowerCase()))];
      uniqueInterests.forEach(interesse => {
        if (!interestMap[interesse]) {
          interestMap[interesse] = new Set();
        }
        interestMap[interesse].add(lead.id);
      });
    });

    return Object.entries(interestMap).map(([interesse, userIds]) => ({
      name: interesse,
      value: userIds.size,
    })).sort((a, b) => b.value - a.value);
  }, [leads]);

  // Lista de todos os interesses para o filtro
  const allInterests = useMemo(() => {
    const interests = new Set<string>();
    leads?.forEach(lead => {
      lead.interesses.forEach(i => interests.add(i.toLowerCase()));
    });
    return Array.from(interests).sort();
  }, [leads]);

  // Filtrar leads baseado no interesse selecionado
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (selectedInterest === 'all') return leads;
    return leads.filter(lead => 
      lead.interesses.some(i => i.toLowerCase() === selectedInterest)
    );
  }, [leads, selectedInterest]);

  const sortedWords = uniqueInterestsByUser.slice(0, 20);
  const maxCount = sortedWords[0]?.value || 1;

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('chat_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Lead excluído com sucesso');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleExportCSV = () => {
    if (!filteredLeads || filteredLeads.length === 0) {
      toast.error('Nenhum lead para exportar');
      return;
    }

    const headers = ['Nome', 'Apelido', 'WhatsApp', 'Interesses', 'Primeira Interação', 'Última Interação', 'Mensagens'];
    const csvData = filteredLeads.map(lead => [
      lead.nome,
      lead.apelido || '-',
      lead.whatsapp,
      lead.interesses.join('; '),
      format(new Date(lead.primeira_interacao), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      format(new Date(lead.ultima_interacao), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      lead.mensagens.length.toString(),
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filterSuffix = selectedInterest !== 'all' ? `_${selectedInterest}` : '';
    link.download = `leads_chat${filterSuffix}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV exportado com sucesso');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Filtrados</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLeads.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interesses Únicos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueInterestsByUser.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza - Temas Mais Mencionados */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Interesses</CardTitle>
          <CardDescription>Temas mais mencionados por usuário único (cada usuário conta uma vez por tema)</CardDescription>
        </CardHeader>
        <CardContent>
          {uniqueInterestsByUser.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum interesse capturado ainda
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={uniqueInterestsByUser.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {uniqueInterestsByUser.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads do Chat</CardTitle>
              <CardDescription>
                Usuários que iniciaram conversa com o Uivo do Lobo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedInterest} onValueChange={setSelectedInterest}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por interesse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os interesses</SelectItem>
                  {allInterests.map(interest => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {selectedInterest === 'all' ? 'Nenhum lead capturado ainda' : 'Nenhum lead encontrado com este interesse'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Interesses</TableHead>
                  <TableHead>Primeira Interação</TableHead>
                  <TableHead>Última Interação</TableHead>
                  <TableHead>Mensagens</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{lead.nome}</div>
                          {lead.apelido && (
                            <div className="text-xs text-muted-foreground">
                              "{lead.apelido}"
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {lead.whatsapp}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lead.interesses.length === 0 ? (
                          <span className="text-xs text-muted-foreground">-</span>
                        ) : (
                          lead.interesses.slice(0, 3).map((interesse, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {interesse}
                            </Badge>
                          ))
                        )}
                        {lead.interesses.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{lead.interesses.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(lead.primeira_interacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(lead.ultima_interacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lead.mensagens.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setLeadToDelete(lead.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leadToDelete && handleDeleteLead(leadToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChatLeadsTab;
