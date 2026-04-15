import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Loader2, X, Star, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

interface Jogador {
  id: number;
  nome: string;
  nivel_estrelas: number;
  ativo: boolean;
  data_cadastro: string;
}

const NIVEIS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

const Players = () => {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingJogador, setEditingJogador] = useState<Jogador | null>(null);

  const [nome, setNome] = useState("");
  const [nivelEstrelas, setNivelEstrelas] = useState(1.0);

  useEffect(() => {
    fetchJogadores();
  }, []);

  const fetchJogadores = async () => {
    try {
      const res = await api.get("/jogadores/");
      setJogadores(res.data);
    } catch {
      toast.error("Erro ao carregar jogadores.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingJogador) {
        await api.put(`/jogadores/${editingJogador.id}/`, {
          nome,
          nivel_estrelas: nivelEstrelas,
          ativo: editingJogador.ativo,
        });
        toast.success("Jogador atualizado!");
      } else {
        await api.post("/jogadores/", { nome, nivel_estrelas: nivelEstrelas });
        toast.success("Jogador cadastrado!");
      }
      fetchJogadores();
      closeModal();
    } catch (error: any) {
      const msg =
        error.response?.data?.nome?.[0] ||
        error.response?.data?.nivel_estrelas?.[0] ||
        "Erro ao salvar jogador.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (jogador: Jogador) => {
    try {
      await api.delete(`/jogadores/${jogador.id}/`);
      toast.success(`${jogador.nome} desativado.`);
      fetchJogadores();
    } catch {
      toast.error("Erro ao desativar jogador.");
    }
  };

  const openModal = (jogador?: Jogador) => {
    if (jogador) {
      setEditingJogador(jogador);
      setNome(jogador.nome);
      setNivelEstrelas(jogador.nivel_estrelas);
    } else {
      setEditingJogador(null);
      setNome("");
      setNivelEstrelas(1.0);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJogador(null);
  };

  const renderEstrelas = (nivel: number) => {
    return (
      <span className="flex items-center gap-0.5 text-yellow-500 font-medium text-sm">
        <Star className="h-4 w-4 fill-yellow-400" />
        {nivel.toFixed(1)}
      </span>
    );
  };

  const filteredJogadores = jogadores.filter((j) =>
    j.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Jogadores</h1>
          <p className="text-gray-600">Gerencie os atletas cadastrados.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Jogador
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isFetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJogadores.length > 0 ? (
                  filteredJogadores.map((jogador) => (
                    <tr key={jogador.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {jogador.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4 text-sm font-medium text-gray-900">{jogador.nome}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderEstrelas(jogador.nivel_estrelas)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${jogador.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {jogador.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(jogador.data_cadastro).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <button onClick={() => openModal(jogador)} className="text-blue-600 hover:text-blue-900 p-2" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {jogador.ativo && (
                          <button onClick={() => handleDeactivate(jogador)} className="text-red-500 hover:text-red-700 p-2" title="Desativar">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum jogador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingJogador ? "Editar Jogador" : "Novo Jogador"}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Estrelas</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={nivelEstrelas}
                  onChange={(e) => setNivelEstrelas(parseFloat(e.target.value))}
                >
                  {NIVEIS.map((n) => (
                    <option key={n} value={n}>{"⭐".repeat(Math.ceil(n))} {n.toFixed(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancelar</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
