interface PreferencesData {
  theme: string;
  language: string;
  notifications: boolean;
}

interface Step4PreferencesProps {
  preferences: PreferencesData;
  setPreferences: (preferences: PreferencesData) => void;
}

const Step4Preferences = ({ preferences, setPreferences }: Step4PreferencesProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setPreferences({
        ...preferences,
        [name]: checked,
      });
    } else {
      setPreferences({
        ...preferences,
        [name]: value,
      });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferencias</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tema
          </label>
          <select
            name="theme"
            value={preferences.theme}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idioma
          </label>
          <select
            name="language"
            value={preferences.language}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="en">Inglés</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="notifications"
            checked={preferences.notifications}
            onChange={handleChange}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Recibir notificaciones por email
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step4Preferences;
