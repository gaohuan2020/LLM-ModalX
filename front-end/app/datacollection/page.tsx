'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, Clock, Users, ChevronDown, BarChart2, Mic, Square, Play, Pause } from 'lucide-react';

const popularCourses = [
  {
    id: 1,
    title: 'UI/UX Design Fundamentals',
    duration: '1024 Tokens',
    image: 'https://picsum.photos/seed/text1/400/250',
    category: 'Text',
  },
  {
    id: 3,
    title: 'Digital Marketing Strategy',
    duration: '600*480',
    image: 'https://picsum.photos/seed/Image/400/250',
    category: 'Image',
  },
  {
    id: 4,
    title: 'Data Science Essentials',
    duration: '10s',
    image: 'https://picsum.photos/seed/audio1/400/250',
    category: 'Audio',
  },
];

const categories = [
  'All',
  'Audio',
  'Text',
  'Image',
];

export default function CoursesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  const handleRecordingToggle = () => {
    if (!isRecording) {
      setRecordingTime(0);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex gap-6 p-6 bg-[#FAF8F8] min-h-screen">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Data Capsule Powered by AI</h1>
            <p className="text-sm text-gray-500 mt-1">Collect Your Data</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
              <span>This Year</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Recording Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleRecordingToggle}
                className={`p-3 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-96 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} transition-all`}
                    style={{ width: `${isRecording ? '100%' : '0%'}` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                Save
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 text-sm font-medium rounded-full bg-white text-gray-700 hover:bg-gray-50 whitespace-nowrap border border-gray-200"
            >
              {category}
            </button>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-white/90 rounded-full">
                    {course.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="hidden lg:block w-80">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-200 relative overflow-hidden">
              <Image
                src="https://picsum.photos/seed/user/200"
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#E0E0FF]">
              <h4 className="font-medium mb-2">Number of Audios</h4>
              <p className="text-2xl font-bold text-[#14142B]">324</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>

            <div className="p-4 rounded-lg bg-[#FFE0E0]">
              <h4 className="font-medium mb-2">Number of Texts</h4>
              <p className="text-2xl font-bold text-[#B91C1C]">5</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            <div className="p-4 rounded-lg bg-[#E0F2FF]">
              <h4 className="font-medium mb-2">Number of Images</h4>
              <p className="text-2xl font-bold text-[#1E40AF]">12</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Calendar</h3>
            <div className="text-sm font-medium text-gray-900">December 2024</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isToday = day === 19; // Current date is 19
              return (
                <div
                  key={day}
                  className={`
                    py-2 rounded-lg flex items-center justify-center
                    ${isToday
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
