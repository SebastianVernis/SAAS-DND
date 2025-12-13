interface Step3UserRoleProps {
  userRole: string;
  setUserRole: (userRole: string) => void;
}

const Step3UserRole = ({ userRole, setUserRole }: Step3UserRoleProps) => {
  const roles = [
    { value: 'designer', label: 'Diseñador' },
    { value: 'developer', label: 'Desarrollador' },
    { value: 'pm', label: 'Project Manager' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">¿Cuál es tu rol?</h3>
      <div className="space-y-4">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              userRole === role.value
                ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="userRole"
              value={role.value}
              checked={userRole === role.value}
              onChange={() => setUserRole(role.value)}
              className="sr-only"
            />
            <p className="font-semibold text-gray-800">{role.label}</p>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Step3UserRole;
