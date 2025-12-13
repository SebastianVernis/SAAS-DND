import { useEffect, useState } from 'react';
import { teamApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Modal from '../../components/dashboard/Modal';

interface Member {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function Team() {
  const { user, subscription } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'editor',
    message: '',
  });
  const [inviting, setInviting] = useState(false);

  const isAdmin = members.find((m) => m.userId === user?.id)?.role === 'admin';

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        teamApi.getMembers(),
        teamApi.getInvitations(),
      ]);
      setMembers(membersRes.data.members);
      setInvitations(invitationsRes.data.invitations);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      await teamApi.invite(inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'editor', message: '' });
      loadTeam(); // Reload to show new invitation
      alert('Invitación enviada por email');
    } catch (error: any) {
      if (error.response?.data?.upgrade) {
        alert('Has alcanzado el límite de miembros. Upgrade tu plan.');
      } else {
        alert(error.response?.data?.error || 'Error al enviar invitación');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return;

    try {
      await teamApi.removeMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (error) {
      alert('Error al eliminar miembro');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('¿Revocar esta invitación?')) return;

    try {
      await teamApi.revokeInvitation(invitationId);
      setInvitations(invitations.filter((i) => i.id !== invitationId));
    } catch (error) {
      alert('Error al revocar invitación');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (subscription?.plan === 'free') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Team Management no disponible
          </h2>
          <p className="text-gray-600 mb-6">
            Actualiza a plan Teams o Enterprise para invitar miembros y colaborar en tiempo real.
          </p>
          <button className="btn-primary">Upgrade Plan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
            <p className="text-gray-600">
              {members.length} miembro{members.length !== 1 ? 's' : ''}
              {subscription?.plan === 'teams' && ` / 10 máximo`}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowInviteModal(true)} className="btn-primary flex items-center gap-2">
              <span>+</span>
              Invitar Miembro
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ingresó
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.userName}</p>
                      <p className="text-sm text-gray-500">{member.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 capitalize">{member.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    {member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Invitaciones Pendientes ({invitations.length})
          </h3>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{inv.email}</p>
                  <p className="text-sm text-gray-600">
                    Rol: <span className="font-semibold capitalize">{inv.role}</span> · Expira:{' '}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRevokeInvitation(inv.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Revocar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invitar Miembro"
        maxWidth="lg"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="usuario@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="viewer">Viewer - Solo lectura</option>
              <option value="editor">Editor - Puede editar proyectos</option>
              <option value="admin">Admin - Control total</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje (opcional)
            </label>
            <textarea
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Te invito a unirte al equipo..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={inviting || !inviteForm.email}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
