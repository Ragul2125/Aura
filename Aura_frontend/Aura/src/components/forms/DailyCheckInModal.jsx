import { useState } from 'react';
import { userDataStore } from '../../utils/userDataStore.js';
import { X, Sun, Battery, Smile } from 'lucide-react';

export default function DailyCheckInModal({ isOpen, onClose }) {
    const [energy, setEnergy] = useState(3);
    const [mood, setMood] = useState('Neutral');
    const [sleepQuality, setSleepQuality] = useState('Okay');

    if (!isOpen) return null;

    const handleSubmit = () => {
        userDataStore.addCheckIn({
            energyLevel: energy,
            mood: mood,
            sleepQuality: sleepQuality
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Daily Check-in</h2>
                        <p className="text-sm text-gray-500">How are you feeling today?</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Energy Level */}
                    <div className="space-y-3 pb-5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Battery size={18} className="text-green-500" /> Energy Level ({energy}/5)
                        </label>
                        <input
                            type="range" min="1" max="5"
                            value={energy}
                            onChange={(e) => setEnergy(parseInt(e.target.value))}
                            className="w-full accent-green-500 h-2 bg-gray-100 rounded-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 px-1">
                            <span>Drained</span>
                            <span>Charged</span>
                        </div>
                    </div>

                    {/* Mood */}
                    <div className="space-y-3 pb-5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Smile size={18} className="text-yellow-500" /> Mood
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Calm', 'Stressed', 'Motivated', 'Low', 'Neutral'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMood(m)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                    ${mood === m ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sleep Quality */}
                    <div className="space-y-3 pb-5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Sun size={18} className="text-blue-500" /> Sleep Quality
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Poor', 'Okay', 'Good'].map(qual => (
                                <button
                                    key={qual}
                                    onClick={() => setSleepQuality(qual)}
                                    className={`py-2 rounded-xl text-sm font-medium border transition-all
                    ${sleepQuality === qual ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {qual}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 active:scale-95 transition-all"
                    >
                        Save Check-in
                    </button>
                </div>

            </div>
        </div>
    );
}
