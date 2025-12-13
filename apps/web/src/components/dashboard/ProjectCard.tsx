import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export default function ProjectCard({
  id,
  name,
  description,
  thumbnail,
  updatedAt,
  onDelete,
  onDuplicate,
}: ProjectCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all group overflow-hidden">
      {/* Thumbnail */}
      <Link to={`/editor/${id}`} className="block">
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center relative overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl opacity-50">🎨</div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white font-semibold bg-purple-600 px-4 py-2 rounded-lg transition-opacity">
              Abrir Editor
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/editor/${id}`}>
          <h3 className="font-bold text-gray-900 mb-1 hover:text-purple-600 transition-colors truncate">
            {name}
          </h3>
        </Link>
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Actualizado {formatDate(updatedAt)}
          </p>
          <div className="flex gap-2">
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="text-gray-400 hover:text-purple-600 transition-colors p-1"
                title="Duplicate project"
              >
                📋
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Delete project"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
