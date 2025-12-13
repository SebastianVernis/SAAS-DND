interface OrganizationData {
  name: string;
  industry: string;
  size: string;
}

interface Step2OrganizationProps {
  organization: OrganizationData;
  setOrganization: (organization: OrganizationData) => void;
}

const Step2Organization = ({ organization, setOrganization }: Step2OrganizationProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrganization({
      ...organization,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Datos de la Organización</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Organización
          </label>
          <input
            type="text"
            name="name"
            value={organization.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Tu empresa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industria
          </label>
          <input
            type="text"
            name="industry"
            value={organization.industry}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ej: Software, Marketing"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño de la Empresa
          </label>
          <select
            name="size"
            value={organization.size}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          >
            <option value="">Selecciona un tamaño</option>
            <option value="1-10">1-10 empleados</option>
            <option value="11-50">11-50 empleados</option>
            <option value="51-200">51-200 empleados</option>
            <option value="201-1000">201-1000 empleados</option>
            <option value="1000+">1000+ empleados</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Step2Organization;
