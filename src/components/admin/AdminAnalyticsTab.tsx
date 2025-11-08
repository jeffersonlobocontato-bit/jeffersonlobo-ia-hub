import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { Users, Eye, Clock, MousePointer, TrendingUp, Activity } from 'lucide-react';
import { Heatmap } from './Heatmap';

interface AnalyticsSummary {
  totalVisitors: number;
  uniqueVisitors: number;
  totalClicks: number;
  avgDuration: number;
}

interface PageStat {
  page_path: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
}

interface TimeSeriesData {
  date: string;
  visitors: number;
  views: number;
}

interface CTAStat {
  cta_name: string;
  cta_location: string;
  total_clicks: number;
  unique_sessions: number;
}

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
  description?: string;
}

interface ConversionFunnel {
  totalVisitors: number;
  viewedHero: number;
  viewedBook: number;
  viewedBlog: number;
  viewedPodcast: number;
  viewedTesteIA: number;
  clickedAnyCTA: number;
  clickedChatUivo: number;
  clickedContact: number;
  clickedBookPurchase: number;
  clickedTesteIA: number;
}

type Period = '7' | '30' | '90';

export const AdminAnalyticsTab = () => {
  const [period, setPeriod] = useState<Period>('30');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [ctaStats, setCtaStats] = useState<CTAStat[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Load summary stats
      const { data: analyticsData } = await supabase
        .from('site_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const { data: clicksData } = await supabase
        .from('click_events')
        .select('id')
        .gte('created_at', startDate.toISOString());

      if (analyticsData) {
        const uniqueSessions = new Set(analyticsData.map(a => a.session_id));
        const avgDur = analyticsData.reduce((acc, a) => acc + (a.duration_seconds || 0), 0) / analyticsData.length;
        
        setSummary({
          totalVisitors: analyticsData.length,
          uniqueVisitors: uniqueSessions.size,
          totalClicks: clicksData?.length || 0,
          avgDuration: Math.round(avgDur),
        });

        // Group by page
        const pageMap = new Map<string, PageStat>();
        analyticsData.forEach(a => {
          const existing = pageMap.get(a.page_path) || {
            page_path: a.page_path,
            views: 0,
            unique_visitors: 0,
            avg_duration: 0,
          };
          existing.views += 1;
          pageMap.set(a.page_path, existing);
        });

        // Calculate unique visitors per page
        pageMap.forEach((stat, path) => {
          const sessions = new Set(analyticsData.filter(a => a.page_path === path).map(a => a.session_id));
          stat.unique_visitors = sessions.size;
          const durations = analyticsData.filter(a => a.page_path === path && a.duration_seconds);
          stat.avg_duration = durations.length > 0 
            ? Math.round(durations.reduce((acc, a) => acc + (a.duration_seconds || 0), 0) / durations.length)
            : 0;
        });

        setPageStats(Array.from(pageMap.values()).sort((a, b) => b.views - a.views));

        // Time series data (group by day)
        const dateMap = new Map<string, { visitors: Set<string>, views: number }>();
        analyticsData.forEach(a => {
          const date = new Date(a.created_at).toLocaleDateString('pt-BR');
          const existing = dateMap.get(date) || { visitors: new Set(), views: 0 };
          existing.visitors.add(a.session_id);
          existing.views += 1;
          dateMap.set(date, existing);
        });

        const timeSeries = Array.from(dateMap.entries())
          .map(([date, data]) => ({
            date,
            visitors: data.visitors.size,
            views: data.views,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setTimeSeriesData(timeSeries);
      }

      // Load CTA stats
      const { data: ctaData } = await supabase
        .from('cta_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ctaData) {
        const ctaMap = new Map<string, CTAStat>();
        ctaData.forEach(cta => {
          const key = `${cta.cta_name}_${cta.cta_location}`;
          const existing = ctaMap.get(key) || {
            cta_name: cta.cta_name,
            cta_location: cta.cta_location,
            total_clicks: 0,
            unique_sessions: 0,
          };
          existing.total_clicks += 1;
          ctaMap.set(key, existing);
        });

        // Calculate unique sessions per CTA
        ctaMap.forEach((stat, key) => {
          const sessions = new Set(
            ctaData
              .filter(c => `${c.cta_name}_${c.cta_location}` === key)
              .map(c => c.session_id)
          );
          stat.unique_sessions = sessions.size;
        });

        setCtaStats(Array.from(ctaMap.values()).sort((a, b) => b.total_clicks - a.total_clicks));
      }

      // Calculate conversion funnel
      if (analyticsData && ctaData) {
        const allSessions = new Set(analyticsData.map(a => a.session_id));
        
        // Sessions that viewed specific sections (based on scroll depth or duration)
        const viewedHero = new Set(analyticsData.filter(a => a.page_path === '/' && (a.duration_seconds || 0) >= 3).map(a => a.session_id));
        const viewedBook = new Set(analyticsData.filter(a => a.page_path === '/' && (a.duration_seconds || 0) >= 10).map(a => a.session_id));
        const viewedBlog = new Set(analyticsData.filter(a => a.page_path === '/' && (a.duration_seconds || 0) >= 20).map(a => a.session_id));
        const viewedPodcast = new Set(analyticsData.filter(a => a.page_path === '/' && (a.duration_seconds || 0) >= 30).map(a => a.session_id));
        const viewedTesteIA = new Set(analyticsData.filter(a => a.page_path === '/teste-ia' || (a.page_path === '/' && (a.duration_seconds || 0) >= 40)).map(a => a.session_id));
        
        // Sessions that clicked any CTA
        const clickedAnyCTA = new Set(ctaData.map(c => c.session_id));
        const clickedChatUivo = new Set(ctaData.filter(c => c.cta_name === 'chat_uivo_open').map(c => c.session_id));
        const clickedContact = new Set(ctaData.filter(c => c.cta_name === 'contact_whatsapp').map(c => c.session_id));
        const clickedBookPurchase = new Set(ctaData.filter(c => c.cta_name === 'book_purchase').map(c => c.session_id));
        const clickedTesteIA = new Set(ctaData.filter(c => c.cta_name === 'teste_ia_start').map(c => c.session_id));

        setConversionFunnel({
          totalVisitors: allSessions.size,
          viewedHero: viewedHero.size,
          viewedBook: viewedBook.size,
          viewedBlog: viewedBlog.size,
          viewedPodcast: viewedPodcast.size,
          viewedTesteIA: viewedTesteIA.size,
          clickedAnyCTA: clickedAnyCTA.size,
          clickedChatUivo: clickedChatUivo.size,
          clickedContact: clickedContact.size,
          clickedBookPurchase: clickedBookPurchase.size,
          clickedTesteIA: clickedTesteIA.size,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFunnelData = (): FunnelStage[] => {
    if (!conversionFunnel) return [];
    
    return [
      {
        name: 'Visitantes Totais',
        value: conversionFunnel.totalVisitors,
        fill: 'hsl(var(--chart-1))',
        description: 'Entraram no site',
      },
      {
        name: 'Engajamento Inicial',
        value: conversionFunnel.viewedHero,
        fill: 'hsl(var(--chart-2))',
        description: 'Passaram 3+ segundos',
      },
      {
        name: 'Exploraram Conteúdo',
        value: conversionFunnel.viewedBook,
        fill: 'hsl(var(--chart-3))',
        description: 'Navegaram seções principais',
      },
      {
        name: 'Clicaram em CTA',
        value: conversionFunnel.clickedAnyCTA,
        fill: 'hsl(var(--primary))',
        description: 'Interagiram com CTAs',
      },
    ];
  };

  const calculateConversionRate = (current: number, previous: number): string => {
    if (previous === 0) return '0%';
    return `${((current / previous) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Visitas</p>
              <p className="text-3xl font-bold">{summary?.totalVisitors || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Visitantes Únicos</p>
              <p className="text-3xl font-bold">{summary?.uniqueVisitors || 0}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Cliques</p>
              <p className="text-3xl font-bold">{summary?.totalClicks || 0}</p>
            </div>
            <MousePointer className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio (s)</p>
              <p className="text-3xl font-bold">{summary?.avgDuration || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="inline-flex w-full mb-8 overflow-x-auto">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="ctas">CTAs</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Visitas ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" name="Visitantes Únicos" />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-2))" name="Total de Visitas" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Funil de Conversão - Jornada do Usuário
            </h3>
            
            {conversionFunnel && (
              <>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <FunnelChart>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as FunnelStage;
                            return (
                              <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-2xl font-bold text-primary">{data.value}</p>
                                <p className="text-sm text-muted-foreground">{data.description}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Funnel
                        dataKey="value"
                        data={generateFunnelData()}
                        isAnimationActive
                      >
                        <LabelList 
                          position="center" 
                          fill="#fff" 
                          stroke="none" 
                          dataKey="name" 
                          style={{ fontSize: '14px', fontWeight: 'bold' }}
                        />
                        <LabelList 
                          position="center" 
                          fill="#fff" 
                          stroke="none" 
                          dataKey="value" 
                          style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}
                          dy={20}
                        />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>

                {/* Conversion Rates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="text-sm text-muted-foreground mb-1">Taxa de Engajamento</div>
                    <div className="text-2xl font-bold text-primary">
                      {calculateConversionRate(conversionFunnel.viewedHero, conversionFunnel.totalVisitors)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conversionFunnel.viewedHero} de {conversionFunnel.totalVisitors} visitantes
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10">
                    <div className="text-sm text-muted-foreground mb-1">Taxa de Exploração</div>
                    <div className="text-2xl font-bold text-secondary">
                      {calculateConversionRate(conversionFunnel.viewedBook, conversionFunnel.viewedHero)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conversionFunnel.viewedBook} navegaram mais fundo
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <div className="text-sm text-muted-foreground mb-1">Taxa de Conversão</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {calculateConversionRate(conversionFunnel.clickedAnyCTA, conversionFunnel.totalVisitors)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conversionFunnel.clickedAnyCTA} converteram
                    </div>
                  </Card>
                </div>

                {/* CTA Performance Breakdown */}
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-semibold mb-3">Performance por CTA</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Chat Uivo</div>
                      <div className="text-lg font-bold">{conversionFunnel.clickedChatUivo}</div>
                      <div className="text-xs text-primary">
                        {calculateConversionRate(conversionFunnel.clickedChatUivo, conversionFunnel.totalVisitors)}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Contato</div>
                      <div className="text-lg font-bold">{conversionFunnel.clickedContact}</div>
                      <div className="text-xs text-primary">
                        {calculateConversionRate(conversionFunnel.clickedContact, conversionFunnel.totalVisitors)}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Compra Livro</div>
                      <div className="text-lg font-bold">{conversionFunnel.clickedBookPurchase}</div>
                      <div className="text-xs text-primary">
                        {calculateConversionRate(conversionFunnel.clickedBookPurchase, conversionFunnel.totalVisitors)}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Teste IA</div>
                      <div className="text-lg font-bold">{conversionFunnel.clickedTesteIA}</div>
                      <div className="text-xs text-primary">
                        {calculateConversionRate(conversionFunnel.clickedTesteIA, conversionFunnel.totalVisitors)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Insights */}
                <Card className="p-4 mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Insights da Jornada
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        <strong>{calculateConversionRate(conversionFunnel.viewedHero, conversionFunnel.totalVisitors)}</strong> dos visitantes permanecem pelo menos 3 segundos (bounce rate: {calculateConversionRate(conversionFunnel.totalVisitors - conversionFunnel.viewedHero, conversionFunnel.totalVisitors)})
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        <strong>{calculateConversionRate(conversionFunnel.clickedAnyCTA, conversionFunnel.viewedHero)}</strong> dos visitantes engajados clicam em algum CTA
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        CTA mais efetivo: <strong>
                          {conversionFunnel.clickedChatUivo >= Math.max(conversionFunnel.clickedContact, conversionFunnel.clickedBookPurchase, conversionFunnel.clickedTesteIA) 
                            ? 'Chat Uivo do Lobo' 
                            : conversionFunnel.clickedContact >= Math.max(conversionFunnel.clickedBookPurchase, conversionFunnel.clickedTesteIA)
                            ? 'Entrar em Contato'
                            : conversionFunnel.clickedBookPurchase >= conversionFunnel.clickedTesteIA
                            ? 'Comprar Livro'
                            : 'Teste IA'}
                        </strong>
                      </span>
                    </li>
                  </ul>
                </Card>
              </>
            )}

            {!conversionFunnel && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Dados insuficientes para gerar funil de conversão</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Páginas Mais Visitadas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page_path" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="hsl(var(--primary))" name="Visualizações" />
                <Bar dataKey="unique_visitors" fill="hsl(var(--chart-2))" name="Visitantes Únicos" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estatísticas por Página</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Página</th>
                    <th className="text-right p-2">Visitas</th>
                    <th className="text-right p-2">Únicos</th>
                    <th className="text-right p-2">Tempo Médio (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStats.map((stat, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-sm">{stat.page_path}</td>
                      <td className="text-right p-2">{stat.views}</td>
                      <td className="text-right p-2">{stat.unique_visitors}</td>
                      <td className="text-right p-2">{stat.avg_duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ctas" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Conversões de CTAs
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ctaStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="cta_name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                          <p className="font-semibold">{payload[0].payload.cta_name}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Local: {payload[0].payload.cta_location}
                          </p>
                          <p className="text-sm">Total: {payload[0].value}</p>
                          <p className="text-sm">Únicos: {payload[0].payload.unique_sessions}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="total_clicks" fill="hsl(var(--primary))" name="Total de Cliques" />
                <Bar dataKey="unique_sessions" fill="hsl(var(--chart-2))" name="Sessões Únicas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalhes de CTAs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">CTA</th>
                    <th className="text-left p-2">Localização</th>
                    <th className="text-right p-2">Total Cliques</th>
                    <th className="text-right p-2">Sessões Únicas</th>
                    <th className="text-right p-2">Taxa Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {ctaStats.map((stat, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{stat.cta_name}</td>
                      <td className="p-2 text-sm text-muted-foreground">{stat.cta_location}</td>
                      <td className="text-right p-2">{stat.total_clicks}</td>
                      <td className="text-right p-2">{stat.unique_sessions}</td>
                      <td className="text-right p-2">
                        {summary?.uniqueVisitors 
                          ? `${((stat.unique_sessions / summary.uniqueVisitors) * 100).toFixed(1)}%`
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {ctaStats.length === 0 && (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum evento de CTA registrado neste período</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mapa de Calor de Cliques</h3>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageStats.map(stat => (
                    <SelectItem key={stat.page_path} value={stat.page_path}>
                      {stat.page_path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Heatmap pagePath={selectedPage} period={parseInt(period)} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
