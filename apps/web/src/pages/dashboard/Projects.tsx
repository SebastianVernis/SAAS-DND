import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import ProjectCard from '../../components/dashboard/ProjectCard';
import Modal from '../../components/dashboard/Modal';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
}

export default function Projects() {
  const { subscription } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Create project modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    template: 'blank',
  });
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const response = await projectsApi.getAll({ search: search || undefined });
      setProjects(response.data.projects);
    } catch {
      console.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await projectsApi.create(createForm);
      setProjects([response.data.project, ...projects]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', template: 'blank' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { upgrade?: boolean } } };
      if (error.response?.data?.upgrade) {
        alert('Has alcanzado el límite de proyectos. Upgrade tu plan para crear más.');
      } else {
        alert('Error al crear proyecto');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch {
      alert('Error al eliminar proyecto');
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const response = await projectsApi.duplicate(projectId);
      setProjects([response.data.project, ...projects]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { upgrade?: boolean } } };
      if (error.response?.data?.upgrade) {
        alert('Has alcanzado el límite de proyectos.');
      } else {
        alert('Error al duplicar proyecto');
      }
    }
  };

  const filteredProjects = search
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Proyectos</h1>
            <p className="text-gray-600">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
              {subscription?.plan === 'free' && ` / 5 máximo`}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nuevo Proyecto
          </button>
        </div>

        {/* Search and View Toggle */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Buscar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded ${
                view === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded ${
                view === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-gray-600 mb-6">
            {search
              ? 'Intenta con otra búsqueda'
              : 'Crea tu primer proyecto y empieza a diseñar'}
          </p>
          {!search && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + Crear Proyecto
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onDelete={() => handleDeleteProject(project.id)}
              onDuplicate={() => handleDuplicateProject(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg divide-y">
          {filteredProjects.map((project) => (
            <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-3xl">🎨</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 truncate">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Actualizado {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDuplicateProject(project.id)}
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Proyecto"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Mi Proyecto Increíble"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe tu proyecto..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'blank', label: 'Blank', icon: '📄', desc: 'Empieza desde cero' },
                { value: 'landing', label: 'Landing', icon: '🌐', desc: 'Página de aterrizaje' },
              ].map((template) => (
                <button
                  key={template.value}
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, template: template.value })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    createForm.template === template.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-semibold text-gray-900">{template.label}</div>
                  <div className="text-xs text-gray-600">{template.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !createForm.name}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
