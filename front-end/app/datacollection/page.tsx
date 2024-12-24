'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, Clock, Users, ChevronDown, BarChart2, Mic, Square, Play, Pause, Upload } from 'lucide-react';

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

interface AudioData {
  id: number;
  title: string;
  duration: string;
  image: string;
  category: string;
  timestamp: string;
}

export default function CoursesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioList, setAudioList] = useState<AudioData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        setAudioChunks([]);
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('无法访问麦克风，请确保已授予权限。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && audioStream) {
      mediaRecorder.stop();
      audioStream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
      setAudioStream(null);
    }
  };

  const handleUpload = async () => {
    if (!recordedAudio) {
      alert('请先录制音频');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'recording.wav');
      
      const response = await fetch('http://45.252.106.202:5000/api/upload-audio', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      
      const newAudio: AudioData = {
        id: Date.now(),
        title: `Recording_${new Date().toLocaleDateString()}`,
        duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
        image: 'https://picsum.photos/seed/audio1/400/250',
        category: 'Audio',
        timestamp: data.filename
      };
      
      setAudioList(prevList => [newAudio, ...prevList]);
      alert('上传成功！');
      setRecordedAudio(null);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('上传音频失败，请重试。');
    }
  };

  const handleRecordingToggle = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleCancel = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    if (isRecording) {
      stopRecording();
    }
  };

  const getFilteredData = () => {
    const allData = [...audioList, ...popularCourses];
    if (selectedCategory === 'All') {
      return allData;
    }
    return allData.filter(item => item.category === selectedCategory);
  };

  const handleUrlParse = async () => {
    if (!urlInput) {
      alert('请输入URL');
      return;
    }

    try {
      setIsParsingUrl(true);
      const response = await fetch('http://45.252.106.202:5000/api/parse-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
          need_js: true // 默认启用 JavaScript 解析
        }),
      });

      if (!response.ok) {
        throw new Error('URL parsing failed');
      }

      const data = await response.json();
      console.log('Parsing successful:', data);

      // 添加到数据列表
      const newItem = {
        id: Date.now(),
        title: `URL_${new Date().toLocaleDateString()}`,
        duration: `${data.content.length} chars`,
        image: 'https://picsum.photos/seed/text1/400/250',
        category: 'Text',
        timestamp: new Date().toISOString()
      };

      setAudioList(prevList => [newItem, ...prevList]);
      alert('URL解析成功！');
      setUrlInput(''); // 清空输入框

    } catch (error) {
      console.error('Error parsing URL:', error);
      alert('URL解析失败，请重试。');
    } finally {
      setIsParsingUrl(false);
    }
  };

  return (
    <div className="flex gap-6 p-6 bg-[#FAF8F8] min-h-screen overflow-hidden">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Helps You Collect Data More Easily</h1>
            <p className="text-sm text-gray-500 mt-1">Collect Your Data</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
              <span>This Year</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Upload Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label 
                htmlFor="image-upload"
                className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/*" 
                  className="hidden" 
                />
              </label>
              <div className="flex items-center gap-2">
                <div className="w-96 text-sm text-gray-600">
                  No file chosen
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                Upload
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Audio Recording Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleRecordingToggle}
                className={`p-3 rounded-full ${isRecording
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
              <button 
                onClick={handleUpload}
                disabled={!recordedAudio}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                  ${recordedAudio 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Upload
              </button>
              <button 
                onClick={handleCancel}
                disabled={!recordedAudio && !isRecording}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${(recordedAudio || isRecording)
                    ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* URL Parsing Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div className="flex-1">
                <input 
                  type="url" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter URL to parse text"
                  className="w-96 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUrlParse}
                disabled={isParsingUrl || !urlInput}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                  ${isParsingUrl || !urlInput 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                {isParsingUrl ? 'Uploading...' : 'Upload'}
              </button>
              <button 
                onClick={() => setUrlInput('')}
                disabled={isParsingUrl || !urlInput}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isParsingUrl || !urlInput
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } whitespace-nowrap border border-gray-200`}
            >
              {category}
            </button>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getFilteredData().map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-white/90 rounded-full">
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{item.duration}</span>
                    </div>
                    {('timestamp' in item) && typeof item.timestamp === 'string' && (
                      <div className="text-xs text-gray-500">
                        {item.timestamp}
                      </div>
                    )}
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
