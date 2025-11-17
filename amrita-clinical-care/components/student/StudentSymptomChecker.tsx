import React, { useState, useContext } from 'react';
import { UserContext } from '../../App';
import { getSymptomAnalysis } from '../../services/geminiService';
import { SYMPTOM_OPTIONS } from '../../services/mockApi';
import { ShieldQuestion, AlertTriangle, Activity, CheckSquare } from 'lucide-react';

const StudentSymptomChecker: React.FC = () => {
    const { user } = useContext(UserContext);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [otherSymptoms, setOtherSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ priorityLevel: 'Low' | 'Medium' | 'High'; suggestedAction: string } | null>(null);

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
        );
    };

    const handleCheckSymptoms = async () => {
        if (selectedSymptoms.length === 0 && !otherSymptoms) {
            alert('Please select or describe your symptoms.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        const allSymptoms = [...selectedSymptoms];
        if (otherSymptoms) {
            allSymptoms.push(otherSymptoms);
        }
        try {
            if(user && 'studentId' in user) {
                const analysis = await getSymptomAnalysis(user.studentId, allSymptoms);
                setResult(analysis);
            }
        } catch (error) {
            console.error("Error checking symptoms:", error);
            alert("Failed to analyze symptoms. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getResultStyling = (priority: 'Low' | 'Medium' | 'High') => {
        switch (priority) {
            case 'High':
                return {
                    bg: 'bg-red-100',
                    border: 'border-red-500',
                    text: 'text-red-800',
                    icon: <AlertTriangle className="w-12 h-12 text-red-600" />
                };
            case 'Medium':
                return {
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-500',
                    text: 'text-yellow-800',
                    icon: <Activity className="w-12 h-12 text-yellow-600" />
                };
            case 'Low':
            default:
                return {
                    bg: 'bg-green-100',
                    border: 'border-green-500',
                    text: 'text-green-800',
                    icon: <CheckSquare className="w-12 h-12 text-green-600" />
                };
        }
    };

    const resultStyles = result ? getResultStyling(result.priorityLevel) : null;


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Symptom Checker</h1>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start space-x-4 p-4 bg-brand-primary-light border-l-4 border-brand-primary rounded-r-lg">
                    <AlertTriangle className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-brand-primary-dark">Disclaimer</h3>
                        <p className="text-sm text-brand-primary">This tool provides a preliminary assessment and is not a substitute for professional medical advice. For emergencies, please contact the clinic or nearest hospital immediately.</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Select Your Symptoms</h2>
                    <div className="flex flex-wrap gap-3">
                        {SYMPTOM_OPTIONS.map(symptom => (
                            <button
                                key={symptom}
                                onClick={() => handleSymptomToggle(symptom)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${selectedSymptoms.includes(symptom) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary'}`}
                            >
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="otherSymptoms" className="block text-sm font-medium text-gray-700">Other Symptoms</label>
                    <textarea
                        id="otherSymptoms"
                        value={otherSymptoms}
                        onChange={e => setOtherSymptoms(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="Describe any other symptoms you are experiencing..."
                    />
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleCheckSymptoms}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <ShieldQuestion size={20} />
                        )}
                        <span>{isLoading ? 'Analyzing...' : 'Check Symptoms'}</span>
                    </button>
                </div>

                {result && resultStyles && (
                    <div className={`mt-8 p-6 rounded-lg border-l-4 ${resultStyles.bg} ${resultStyles.border} ${resultStyles.text}`}>
                        <div className="flex items-start space-x-4">
                            {resultStyles.icon}
                            <div>
                                <h3 className="text-lg font-bold">Priority Level: {result.priorityLevel}</h3>
                                <p className="mt-1 font-semibold">Suggested Action:</p>
                                <p>{result.suggestedAction}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSymptomChecker;