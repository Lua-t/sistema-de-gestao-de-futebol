import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Users, 
  Trophy, 
  Calendar, 
  TrendingUp,
  PlusCircle,
  ChevronRight,
  Loader2
} from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        api.get("/times"),
        api.get("/jogadores"),
        api.get("/partidas"),
      ]);

      const teams = teamsRes.data;
      const players = playersRes.data;
      const matches = matchesRes.data;

      setStats([
        { name: "Total de Times", value: teams.length.toString(), icon: Users, color: "bg-blue-500" },
        { name: "Total de Jogadores", value: players.length.toString(), icon: Users, color: "bg-green-500" },
        { name: "Partidas Registradas", value: matches.length.toString(), icon: Calendar, color: "bg-purple-500" },
        { name: "Campeonatos", value: "0", icon: Trophy, color: "bg-orange-500" },
      ]);

      setRecentMatches(matches.slice(-5).reverse());
    } catch (error) {
      console.error("Erro ao carregar dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 italic font-serif text-sm">Bem-vindo ao centro de comando, {user?.name}.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/players"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Users className="mr-2 h-4 w-4" />
            Jogadores
          </Link>
          <Link
            to="/matches"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Pelada
          </Link>
        </div>
      </div>

      {/* Stats Grid - Technical Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 border-r border-b sm:border-b-0 last:border-r-0 border-gray-200 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">{stat.name}</p>
              <stat.icon className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches Table - Data Grid Style */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Peladas Recentes</h2>
            <Link to="/matches" className="text-sm text-blue-600 hover:underline flex items-center">
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 p-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Partida</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Data</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Placar</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Status</span>
            </div>
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="grid grid-cols-4 p-4 border-b last:border-b-0 border-gray-100 hover:bg-blue-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-900 truncate">Partida #{match.id.slice(0, 4)}</span>
                  <span className="text-sm text-gray-500 font-mono">{new Date(match.date).toLocaleDateString()}</span>
                  <span className="text-sm text-gray-900 font-bold font-mono">
                    {match.homeGoals} - {match.awayGoals}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest self-center px-2 py-1 rounded-full w-fit bg-green-100 text-green-700`}>
                    Finalizada
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 italic font-serif">
                Nenhuma pelada encontrada.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Dica de Gestão</h2>
          <div className="bg-blue-600 rounded-lg p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Equilíbrio é Tudo</h3>
              <p className="text-blue-100 leading-relaxed mb-6 text-sm">
                Mantenha o nível dos jogadores atualizado para garantir sorteios equilibrados. 
                Você pode editar o nível de estrelas na aba de Jogadores.
              </p>
              <Link
                to="/players"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
              >
                Atualizar Níveis
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
