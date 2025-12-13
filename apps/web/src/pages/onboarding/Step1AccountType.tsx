interface Step1AccountTypeProps {
  accountType: string;
  setAccountType: (accountType: string) => void;
}

const Step1AccountType = ({ accountType, setAccountType }: Step1AccountTypeProps) => {
  const options = [
    { value: 'personal', label: 'Personal', description: 'Para uso individual' },
    { value: 'agency', label: 'Agencia', description: 'Para agencias y equipos' },
    { value: 'company', label: 'Empresa', description: 'Para organizaciones grandes' },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Tipo de Cuenta</h3>
      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              accountType === option.value
                ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="accountType"
              value={option.value}
              checked={accountType === option.value}
              onChange={() => setAccountType(option.value)}
              className="sr-only"
            />
            <div>
              <p className="font-semibold text-gray-800">{option.label}</p>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Step1AccountType;
