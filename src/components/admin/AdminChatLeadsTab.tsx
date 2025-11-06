import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Phone, User, Calendar, TrendingUp } from 'lucide-react';
import { useChatLeads } from '@/hooks/useChatLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminChatLeadsTab = () => {
  const { data: leads, isLoading } = useChatLeads();

  // Calcular mapa de palavras dos interesses
  const wordMap = leads?.reduce((acc, lead) => {
    lead.interesses.forEach(interesse => {
      const key = interesse.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const sortedWords = Object.entries(wordMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  const maxCount = sortedWords[0]?.[1] || 1;

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
            <CardTitle className="text-sm font-medium">Leads Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads?.filter(lead => {
                const today = new Date().toDateString();
                return new Date(lead.created_at).toDateString() === today;
              }).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Interesses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(wordMap).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Palavras (Word Cloud) */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Interesses</CardTitle>
          <CardDescription>Temas mais mencionados nas conversas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sortedWords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum interesse capturado ainda</p>
            ) : (
              sortedWords.map(([word, count]) => {
                const size = Math.max(12, Math.min(32, (count / maxCount) * 32));
                const opacity = 0.5 + (count / maxCount) * 0.5;
                
                return (
                  <Badge
                    key={word}
                    variant="secondary"
                    style={{
                      fontSize: `${size}px`,
                      opacity,
                      padding: `${size / 4}px ${size / 2}px`,
                    }}
                    className="transition-all hover:scale-110"
                  >
                    {word} ({count})
                  </Badge>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Leads do Chat</CardTitle>
          <CardDescription>
            Usuários que iniciaram conversa com o Uivo do Lobo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!leads || leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum lead capturado ainda
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatLeadsTab;
