import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Calendar, AlertTriangle, Coffee } from 'lucide-react';

function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [fajrTime, setFajrTime] = useState<Date | null>(null);
  const [ishaTime, setIshaTime] = useState<Date | null>(null);
  const [customBedtime, setCustomBedtime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setError('Please enable location services to get accurate prayer times.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      const today = new Date();
      
      const ishaTime = new Date(today);
      ishaTime.setHours(20, 30, 0, 0);
      setIshaTime(ishaTime);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(5, 0, 0, 0);
      setFajrTime(tomorrow);
    }
  }, [location]);

  const calculateSleepSchedule = () => {
    if (!fajrTime || !ishaTime) return null;
    
    const wakeUpTime = new Date(fajrTime);
    wakeUpTime.setHours(wakeUpTime.getHours() - 1);
    
    let bedTime: Date;
    if (customBedtime) {
      const [hours, minutes] = customBedtime.split(':').map(Number);
      bedTime = new Date();
      bedTime.setHours(hours, minutes, 0, 0);
      
      // If bedtime is after midnight, adjust the date
      if (hours < 12) {
        bedTime.setDate(bedTime.getDate() + 1);
      }
    } else {
      bedTime = new Date(ishaTime);
      bedTime.setHours(bedTime.getHours() + 2);
    }
    
    const sleepDuration = (wakeUpTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
    const fullSleepCycles = Math.floor(sleepDuration / 1.5);
    
    return {
      bedTime,
      wakeUpTime,
      sleepDuration,
      fullSleepCycles,
      isReducedSleep: sleepDuration < 7,
      napRecommendation: sleepDuration < 7 ? {
        duration: 7 - sleepDuration,
        cycles: Math.ceil((7 - sleepDuration) / 1.5)
      } : null
    };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  const sleepSchedule = calculateSleepSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Moon className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Ramadan Sleep Calculator</h1>
            <p className="text-lg text-indigo-200">Plan your sleep schedule for a blessed Ramadan</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl mb-8">
            <h3 className="text-xl font-semibold mb-4">Customize Your Sleep Schedule</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="bedtime" className="block text-sm font-medium text-indigo-200 mb-2">
                  Set Your Bedtime (optional)
                </label>
                <input
                  type="time"
                  id="bedtime"
                  value={customBedtime}
                  onChange={(e) => setCustomBedtime(e.target.value)}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-indigo-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {customBedtime && (
                <button
                  onClick={() => setCustomBedtime('')}
                  className="px-4 py-2 text-sm bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Reset to Default
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-indigo-200">
              {customBedtime 
                ? "Using your custom bedtime"
                : "Default: 2 hours after Isha prayer (recommended)"}
            </p>
          </div>

          {error ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-8">
              {error}
            </div>
          ) : sleepSchedule ? (
            <div className="space-y-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="text-center p-6 rounded-lg bg-white bg-opacity-5">
                    <Clock className="w-8 h-8 mx-auto mb-3" />
                    <h2 className="text-xl font-semibold mb-2">Bedtime</h2>
                    <p className="text-3xl font-bold text-indigo-300">
                      {formatTime(sleepSchedule.bedTime)}
                    </p>
                    <p className="text-sm mt-2 text-indigo-200">
                      {customBedtime ? "Custom time" : "(2 hours after Isha)"}
                    </p>
                  </div>

                  <div className="text-center p-6 rounded-lg bg-white bg-opacity-5">
                    <Sun className="w-8 h-8 mx-auto mb-3" />
                    <h2 className="text-xl font-semibold mb-2">Wake Up Time</h2>
                    <p className="text-3xl font-bold text-indigo-300">
                      {formatTime(sleepSchedule.wakeUpTime)}
                    </p>
                    <p className="text-sm mt-2 text-indigo-200">(1 hour before Fajr)</p>
                  </div>
                </div>

                {sleepSchedule.isReducedSleep && (
                  <div className="mt-8 p-6 rounded-lg bg-amber-500 bg-opacity-20 border border-amber-500">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <h3 className="text-lg font-semibold">Sleep Compensation Required</h3>
                    </div>
                    <p className="text-indigo-200 mb-4">
                      You'll get approximately {sleepSchedule.sleepDuration.toFixed(1)} hours of night sleep, which is below the recommended 7-8 hours.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                        <h4 className="font-semibold mb-2 text-amber-300">Power Nap Schedule</h4>
                        <p className="text-indigo-200 mb-2">
                          To compensate for the {(7 - sleepSchedule.sleepDuration).toFixed(1)} hours sleep deficit, follow this nap schedule:
                        </p>
                        <ul className="list-disc list-inside text-indigo-200 space-y-2">
                          <li>Primary nap: 90 minutes after Dhuhr prayer (1 complete sleep cycle)</li>
                          {sleepSchedule.napRecommendation && sleepSchedule.napRecommendation.cycles > 1 && (
                            <li>Additional short nap: 20-30 minutes between Asr and Maghrib</li>
                          )}
                        </ul>
                      </div>
                      <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                        <h4 className="font-semibold mb-2 text-amber-300">Nap Tips</h4>
                        <ul className="list-disc list-inside text-indigo-200 space-y-1">
                          <li>Find a quiet, dark place for your nap</li>
                          <li>Set an alarm to avoid oversleeping</li>
                          <li>Avoid napping too close to bedtime</li>
                          <li>Use a sleep mask and earplugs if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 rounded-lg bg-white bg-opacity-5">
                  <Calendar className="w-6 h-6 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Sleep Schedule Details</h3>
                  <ul className="space-y-2 text-indigo-200">
                    <li>• {sleepSchedule.sleepDuration.toFixed(1)} hours of night sleep</li>
                    <li>• {sleepSchedule.fullSleepCycles} complete sleep cycles</li>
                    <li>• Time for Isha prayers and preparation included</li>
                    <li>• Wake up time allows for Suhoor preparation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Coffee className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-semibold">Caffeine Management During Ramadan</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h4 className="font-semibold mb-2 text-indigo-300">Recommended Timing</h4>
                    <ul className="space-y-2 text-indigo-200">
                      <li>• Best time: During Suhoor (pre-dawn meal)</li>
                      <li>• Second best: Right after Iftar (breaking fast)</li>
                      <li>• Avoid: 6 hours before bedtime</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h4 className="font-semibold mb-2 text-indigo-300">Daily Limits</h4>
                    <ul className="space-y-2 text-indigo-200">
                      <li>• Maximum: 400mg caffeine per day</li>
                      <li>• Suhoor: 200-300mg (1-2 cups of coffee)</li>
                      <li>• Iftar: 100-200mg maximum</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h4 className="font-semibold mb-2 text-indigo-300">Tips for Better Sleep</h4>
                    <ul className="space-y-2 text-indigo-200">
                      <li>• Choose coffee over energy drinks (better hydration)</li>
                      <li>• Consider green tea at Iftar (lower caffeine, with calming L-theanine)</li>
                      <li>• Stay hydrated with water between Iftar and bedtime</li>
                      <li>• Avoid caffeine if you have trouble sleeping</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 text-center text-sm text-indigo-200">
            <p>Note: Times are calculated based on your local timezone.</p>
            <p>For most accurate results, please ensure your location services are enabled.</p>
          </div>

          <div className="mt-8 p-6 bg-red-500 bg-opacity-10 border border-red-400 rounded-lg text-center">
            <h4 className="text-lg font-semibold mb-2 text-red-200">Medical Disclaimer</h4>
            <p className="text-sm text-red-100">
              The information provided by this application is for general informational purposes only and is not intended as medical advice. This tool should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding your sleep schedule, caffeine consumption, or fasting during Ramadan. Never disregard professional medical advice or delay in seeking it because of something you have read on this website. If you think you may have a medical emergency, immediately call your doctor or dial emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
