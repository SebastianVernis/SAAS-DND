import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1AccountType from './Step1AccountType';
import Step2Organization from './Step2Organization';
import Step3UserRole from './Step3UserRole';
import Step4Preferences from './Step4Preferences';
import { onboardingApi } from '../../services/api';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    accountType: 'personal',
    organization: {
      name: '',
      industry: '',
      size: '',
    },
    userRole: 'designer',
    preferences: {
      theme: 'light',
      language: 'es',
      notifications: true,
    },
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1AccountType
            accountType={formData.accountType}
            setAccountType={(accountType) =>
              setFormData({ ...formData, accountType })
            }
          />
        );
      case 2:
        if (formData.accountType !== 'personal') {
          return (
            <Step2Organization
              organization={formData.organization}
              setOrganization={(organization) =>
                setFormData({ ...formData, organization })
              }
            />
          );
        }
        // This case should ideally not be reached if accountType is personal
        // due to the logic in nextStep, but as a fallback:
        return null;
      case 3:
        return (
          <Step3UserRole
            userRole={formData.userRole}
            setUserRole={(userRole) =>
              setFormData({ ...formData, userRole })
            }
          />
        );
      case 4:
        return (
          <Step4Preferences
            preferences={formData.preferences}
            setPreferences={(preferences) =>
              setFormData({ ...formData, preferences })
            }
          />
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 2 && formData.accountType !== 'personal') {
      if (!formData.organization.name || !formData.organization.industry || !formData.organization.size) {
        setError('Por favor, completa todos los campos de la organización.');
        return;
      }
    }

    if (step === 1 && formData.accountType === 'personal') {
      setStep(3); // Skip to step 3
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (step === 3 && formData.accountType === 'personal') {
      setStep(1); // Go back to a step 1
    } else {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    try {
      await onboardingApi.complete(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error state here
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Configura tu cuenta
            </h2>
            <p className="text-gray-600 text-sm">
              Paso {step} de 4
            </p>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>{renderStepContent()}</div>

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors ml-auto"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors ml-auto"
            >
              Completar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
