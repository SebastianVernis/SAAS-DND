import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import StatsCard from '../../components/dashboard/StatsCard';
import ProjectCard from '../../components/dashboard/ProjectCard';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
}

export default function DashboardHome() {
  const { user, organization, subscription } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getAll({ limit: 6 });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error al eliminar proyecto');
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const response = await projectsApi.duplicate(projectId);
      setProjects([response.data.project, ...projects]);
    } catch (error: any) {
      if (error.response?.data?.upgrade) {
        alert('Has alcanzado el límite de proyectos. Upgrade tu plan para crear más.');
      } else {
        alert('Error al duplicar proyecto');
      }
    }
  };

  // Mock stats (en producción vienen del backend)
  const stats = {
    projects: { current: projects.length, max: subscription?.plan === 'free' ? 5 : '∞' },
    aiCalls: { current: 7, max: subscription?.plan === 'free' ? 10 : '∞' },
    storage: { current: 45, max: 100, unit: 'MB' },
    members: { current: 1, max: subscription?.plan === 'teams' ? 10 : 1 },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Plan actual: <span className="font-semibold capitalize">{subscription?.plan}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Proyectos"
          value={stats.projects.current}
          max={stats.projects.max}
          icon="📁"
          color="purple"
          progress={
            typeof stats.projects.max === 'number'
              ? (stats.projects.current / stats.projects.max) * 100
              : 0
          }
        />
        <StatsCard
          title="AI Calls"
          value={stats.aiCalls.current}
          max={stats.aiCalls.max}
          icon="🤖"
          color="blue"
          subtitle="Hoy"
          progress={
            typeof stats.aiCalls.max === 'number'
              ? (stats.aiCalls.current / stats.aiCalls.max) * 100
              : 0
          }
        />
        <StatsCard
          title="Storage"
          value={`${stats.storage.current}${stats.storage.unit}`}
          max={`${stats.storage.max}${stats.storage.unit}`}
          icon="💾"
          color="green"
          progress={(stats.storage.current / stats.storage.max) * 100}
        />
        <StatsCard
          title="Miembros"
          value={stats.members.current}
          max={stats.members.max}
          icon="👥"
          color="orange"
          subtitle={subscription?.plan === 'free' ? 'Solo tú' : 'Team activo'}
        />
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Proyectos Recientes</h2>
          <Link
            to="/dashboard/projects"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No tienes proyectos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer proyecto y empieza a diseñar
            </p>
            <Link to="/dashboard/projects" className="btn-primary inline-block">
              + Crear Proyecto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onDelete={() => handleDeleteProject(project.id)}
                onDuplicate={() => handleDuplicateProject(project.id)}
              />
            ))}
            {/* New Project Card */}
            <Link
              to="/dashboard/projects"
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-dashed border-gray-300 hover:border-purple-500 flex flex-col items-center justify-center p-12 min-h-[200px] group"
            >
              <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <p className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                Nuevo Proyecto
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/projects"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📁
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Crear Proyecto
              </h3>
              <p className="text-sm text-gray-600">Empieza desde cero o usa un template</p>
            </div>
          </div>
        </Link>

        {subscription?.plan !== 'free' && (
          <Link
            to="/dashboard/team"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Invitar Equipo
                </h3>
                <p className="text-sm text-gray-600">Colabora en tiempo real</p>
              </div>
            </div>
          </Link>
        )}

        <a
          href="https://github.com/SebastianVernis/SAAS-DND"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📚
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                Documentación
              </h3>
              <p className="text-sm text-gray-600">Guías y tutoriales</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
