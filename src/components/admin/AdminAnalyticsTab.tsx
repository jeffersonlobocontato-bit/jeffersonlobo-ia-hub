import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

type Period = '7' | '30' | '90';

export const AdminAnalyticsTab = () => {
  const [period, setPeriod] = useState<Period>('30');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
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
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
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
