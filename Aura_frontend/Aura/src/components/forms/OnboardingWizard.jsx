import { useState } from 'react';
import { userDataStore } from '../../utils/userDataStore';
import { ArrowRight, ArrowLeft, Check, User, Activity, Moon, Briefcase, MapPin } from 'lucide-react';

export default function OnboardingWizard({ onComplete }) {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Consolidated State for all schemas
    const [formData, setFormData] = useState({
        // UserProfile
        ageRange: '18-25',
        biologicalSex: 'Male',
        occupationType: 'Student',
        workStart: '09:00',
        workEnd: '17:00',
        goals: ['Productivity'],

        // Gender Specific (Shared state, filtered on save)
        cycleStartDate: '',
        averageCycleLength: 28,
        symptoms: [],
        stressLevel: 'Medium',
        workoutFrequency: '1-2/week',
        energyCrashTime: '15:00',

        // SleepRoutine
        averageSleepHours: 7,
        sleepConsistency: 'Fixed',
        peakAlertTime: 'Morning',

        // MobilityProfile
        dailyCommuteMinutes: 30,
        travelMode: 'Public Transport',
        postTravelFatigue: false,

        // TaskPreference
        preferredTaskTypes: ['Deep Focus'],
        breakPreference: 'Short'
    });

    const update = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = () => {
        // 1. Save Profile
        userDataStore.saveProfile({
            ageRange: formData.ageRange,
            biologicalSex: formData.biologicalSex,
            occupationType: formData.occupationType,
            workingHours: { start: formData.workStart, end: formData.workEnd },
            goals: formData.goals
        });

        // 2. Save Gender Specific
        if (formData.biologicalSex === 'Female') {
            userDataStore.saveGenderData('Female', {
                cycleStartDate: formData.cycleStartDate,
                averageCycleLength: formData.averageCycleLength,
                symptoms: formData.symptoms
            });
        } else if (formData.biologicalSex === 'Male') {
            userDataStore.saveGenderData('Male', {
                stressLevel: formData.stressLevel,
                workoutFrequency: formData.workoutFrequency,
                energyCrashTime: formData.energyCrashTime
            });
        }

        // 3. Save Sleep
        userDataStore.saveSleepRoutine({
            averageSleepHours: formData.averageSleepHours,
            sleepConsistency: formData.sleepConsistency,
            peakAlertTime: formData.peakAlertTime
        });

        // 4. Save Mobility & Tasks
        userDataStore.saveMobility({
            dailyCommuteMinutes: formData.dailyCommuteMinutes,
            travelMode: formData.travelMode,
            postTravelFatigue: formData.postTravelFatigue
        });

        userDataStore.saveTaskPrefs({
            preferredTaskTypes: formData.preferredTaskTypes,
            breakPreference: formData.breakPreference
        });

        onComplete();
    };

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 1: return <StepProfile data={formData} update={update} />;
            case 2: return <StepGenderSpecific data={formData} update={update} />;
            case 3: return <StepLifestyle data={formData} update={update} />;
            case 4: return <StepPreferences data={formData} update={update} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-2xl font-bold relative z-10">Setup Your Aura</h2>
                    <p className="text-blue-100 text-sm relative z-10">Step {step} of {totalSteps}</p>

                    {/* Progress Bar */}
                    <div className="mt-4 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {renderStep()}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        {step === totalSteps ? 'Complete Setup' : 'Continue'}
                        {step === totalSteps ? <Check size={16} /> : <ArrowRight size={16} />}
                    </button>
                </div>

            </div>
        </div>
    );
}

// --- Step Components ---

function StepProfile({ data, update }) {
    const toggleGoal = (goal) => {
        const current = data.goals || [];
        if (current.includes(goal)) update('goals', current.filter(g => g !== goal));
        else update('goals', [...current, goal]);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3 pb-5 pb-5">
                <label className="text-sm font-semibold text-gray-700">How old are you?</label>
                <div className="grid grid-cols-2 gap-3">
                    {['18-25', '26-35', '36-45', '46+'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => update('ageRange', opt)}
                            className={`py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${data.ageRange === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200 text-gray-600'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Biological Sex</label>
                <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => update('biologicalSex', opt === 'Other' ? 'Prefer not to say' : opt)}
                            className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${data.biologicalSex === (opt === 'Other' ? 'Prefer not to say' : opt) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200 text-gray-600'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Current Goal</label>
                <div className="flex flex-wrap gap-2">
                    {['Productivity', 'Balance', 'Health'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => toggleGoal(opt)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                ${data.goals.includes(opt) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StepGenderSpecific({ data, update }) {
    if (data.biologicalSex === 'Female') {
        return (
            <div className="space-y-6">
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 mb-4">
                    <h3 className="font-semibold text-pink-700 flex items-center gap-2">
                        <Activity size={18} /> Cycle Tracking
                    </h3>
                    <p className="text-xs text-pink-600 mt-1">Help Aura suggest better energy periods.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Period Start Date</label>
                    <input
                        type="date"
                        value={data.cycleStartDate}
                        onChange={(e) => update('cycleStartDate', e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Cycle Length (Days)</label>
                    <input
                        type="number"
                        value={data.averageCycleLength}
                        onChange={(e) => update('averageCycleLength', parseInt(e.target.value))}
                        className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                    />
                </div>
            </div>
        );
    }

    // Male Default
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                    <Activity size={18} /> Energy Pattern
                </h3>
                <p className="text-xs text-blue-600 mt-1">Optimize your workflow based on energy.</p>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Daily Stress Level</label>
                <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => update('stressLevel', opt)}
                            className={`flex-1 py-2 rounded-lg text-sm border font-medium
                ${data.stressLevel === opt ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white border-gray-200'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Workout Frequency</label>
                <select
                    value={data.workoutFrequency}
                    onChange={(e) => update('workoutFrequency', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-white outline-none"
                >
                    <option>None</option>
                    <option>1-2/week</option>
                    <option>3-5/week</option>
                    <option>Daily</option>
                </select>
            </div>
        </div>
    );
}

function StepLifestyle({ data, update }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Moon size={16} /> Average Sleep
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range" min="3" max="12" step="0.5"
                        value={data.averageSleepHours}
                        onChange={(e) => update('averageSleepHours', parseFloat(e.target.value))}
                        className="flex-1 accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-bold text-blue-600 w-12 text-center">{data.averageSleepHours}h</span>
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Daily Commute (One way)
                </label>
                <div className="flex gap-2">
                    {[15, 30, 45, 60, 90].map(mins => (
                        <button
                            key={mins}
                            onClick={() => update('dailyCommuteMinutes', mins)}
                            className={`py-1.5 px-3 rounded-lg text-sm border font-medium
                  ${data.dailyCommuteMinutes === mins ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200'}`}
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Commute Mode</label>
                <select
                    value={data.travelMode}
                    onChange={(e) => update('travelMode', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-white outline-none"
                >
                    <option>Public Transport</option>
                    <option>Car/Bike</option>
                    <option>Walk</option>
                    <option>Work From Home</option>
                </select>
            </div>
        </div>
    );
}

function StepPreferences({ data, update }) {
    const toggleTask = (task) => {
        const current = data.preferredTaskTypes || [];
        if (current.includes(task)) update('preferredTaskTypes', current.filter(t => t !== task));
        else update('preferredTaskTypes', [...current, task]);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                    <Briefcase size={32} />
                </div>
                <h3 className="font-bold text-gray-800">Final Step!</h3>
                <p className="text-sm text-gray-500">Customize your work style</p>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Preferred Tasks</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Deep Focus', 'Creative', 'Social', 'Physical'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => toggleTask(opt)}
                            className={`p-3 rounded-xl border text-sm font-medium text-left transition-all
                ${data.preferredTaskTypes.includes(opt) ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm' : 'border-gray-100 text-gray-600'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pb-5">
                <label className="text-sm font-semibold text-gray-700">Break Preference</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['Short', 'Long', 'None'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => update('breakPreference', opt)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                 ${data.breakPreference === opt ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
