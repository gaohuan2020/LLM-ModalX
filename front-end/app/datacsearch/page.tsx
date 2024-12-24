'use client';

import Image from 'next/image';
import { Star, Clock, Users, ChevronDown, BarChart2, Search, Calendar, Mic } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useState } from 'react';

// 注册 Chart.js 组件
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const searchResults = [
    {
        id: 1,
        name: 'User Question',
        content: 'hi 今天天气怎么样?',
        type: 'question',
        status: 'completed',
        timestamp: '2h ago',
        avatar: 'https://picsum.photos/seed/user1/200',
    },
    {
        id: 2,
        name: 'AI Response',
        content: '今天的天气在香港非常好！温度大约在20-25°C之间，阳光明媚，适合户外活动，希望你今天愉快！😊',
        type: 'answer',
        status: 'completed',
        timestamp: '2h ago',
        avatar: 'https://picsum.photos/seed/ai1/200',
    },
    {
        id: 3,
        name: 'User Question',
        content: 'What is AGI?',
        type: 'question',
        status: 'completed',
        timestamp: '1h ago',
        avatar: 'https://picsum.photos/seed/user2/200',
    },
    {
        id: 4,
        name: 'AI Response',
        content: 'AGI (Artificial General Intelligence) refers to highly autonomous systems that outperform humans at most economically valuable work.',
        type: 'answer',
        status: 'completed',
        timestamp: '1h ago',
        avatar: 'https://picsum.photos/seed/ai2/200',
    },
    {
        id: 5,
        name: 'User Question',
        content: 'How does machine learning work?',
        type: 'question',
        status: 'pending',
        timestamp: '30m ago',
        avatar: 'https://picsum.photos/seed/user3/200',
    },
];

// 添加新的问答数据
const chatData = {
    question: "hi 今天天气怎么样?",
    answer: "今天的天气在香港非常好！温度大约在20-25°C之间，阳光明媚，适合户外活动，希望你今天愉快！😊",
};

// 添加趋势数据
const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'AGI Search Trend',
            data: [65, 78, 90, 85, 99, 87, 95],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
        },
        x: {
            grid: {
                display: false,
            },
        },
    },
};

// 在文件顶部添加日历数据
const calendarData = {
    month: 'December',
    year: 2024,
    days: [
        { date: 1, isToday: false }, { date: 2, isToday: false }, { date: 3, isToday: false },
        { date: 4, isToday: false }, { date: 5, isToday: false }, { date: 6, isToday: false },
        { date: 7, isToday: false }, { date: 8, isToday: false }, { date: 9, isToday: false },
        { date: 10, isToday: false }, { date: 11, isToday: false }, { date: 12, isToday: false },
        { date: 13, isToday: false }, { date: 14, isToday: false }, { date: 15, isToday: false },
        { date: 16, isToday: false }, { date: 17, isToday: false }, { date: 18, isToday: false },
        { date: 19, isToday: true }, { date: 20, isToday: false }, { date: 21, isToday: false },
        { date: 22, isToday: false }, { date: 23, isToday: false }, { date: 24, isToday: false },
        { date: 25, isToday: false }, { date: 26, isToday: false }, { date: 27, isToday: false },
        { date: 28, isToday: false }, { date: 29, isToday: false }, { date: 30, isToday: false },
        { date: 31, isToday: false }
    ],
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

// 添加搜索结果的类型定义
type SearchResult = {
    id: number;
    name: string;
    content: string;
    type: string;
    status: string;
    timestamp: string;
    avatar: string;
};

export default function CoursesPage() {
    // 添加状态管理
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>(searchResults);
    const [chatData, setChatData] = useState({
        question: searchQuery,
        answer: ""
    });
    const [isListening, setIsListening] = useState(false);

    // 添加搜索处理函数
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        // 在发送请求前就设置加载状态
        setIsLoading(true);
        // 清空之前的结果和回答
        setResults([]);
        setChatData({
            question: searchQuery,
            answer: ""
        });

        try {
            // 添加一个小延迟以确保加载动画显示
            await new Promise(resolve => setTimeout(resolve, 300));

            const response = await fetch('http://45.252.106.202:5000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                setResults(data.results);
                if (data.rag_answer) {
                    setChatData({
                        question: searchQuery,
                        answer: data.rag_answer
                    });
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            // 在错误时显示提示
            setResults([]);
            setChatData({
                question: searchQuery,
                answer: "抱歉，搜索出现错误，请稍后重试。"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 添加语音输入处理函数
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('您的浏览器不支持语音识别功能');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'zh-CN';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };

        recognition.start();
    };

    return (
        <div className="flex gap-6 p-6 bg-[#FAF8F8] min-h-screen">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                        <p className="text-sm text-gray-500 mt-1">Find what you need</p>
                    </div>
                </div>

                <div className="relative mb-6">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 rounded-l-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                            onClick={handleVoiceInput}
                            className={`px-4 py-2 border-t border-b border-gray-200 ${
                                isListening ? 'bg-red-50 text-red-500' : 'bg-white text-gray-500'
                            } hover:bg-gray-50`}
                        >
                            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-full">All</button>
                    <button className="px-4 py-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
                        Text
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
                        Image
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100 rounded-full flex items-center gap-2">
                        Audio
                    </button>
                </div>

                {/* 添加问答展示界面 */}
                <div className="bg-white rounded-xl p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Chat Preview</h2>
                    <div className="space-y-4">
                        {/* 用户问题 */}
                        <div className="flex justify-end">
                            <div className="bg-blue-50 text-gray-800 rounded-lg p-3 max-w-[80%]">
                                <p>{searchQuery || "请输入搜索内容..."}</p>
                            </div>
                        </div>

                        {/* AI回答 */}
                        {isLoading ? (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%] shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : chatData.answer ? (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%] shadow-sm">
                                    <p>{chatData.answer}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* 保持现有的搜索结果展示不变 */}
                <div className="bg-white rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">Search Results</h2>
                    {isLoading ? (
                        // 加载动画
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-500">Searching for results...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4 mb-8">
                            {results.map((result) => (
                                <div key={result.id} className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                        <Image
                                            src={result.avatar}
                                            alt={result.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{result.name}</h3>
                                            <span className="text-sm text-gray-500">{result.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">{result.content}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-sm ${result.type === 'answer' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {result.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // 无搜索结果时显示
                        <div className="text-center py-10">
                            <p className="text-gray-500">No results found. Try different keywords.</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 mb-8">
                            <div className="flex items-center text-sm text-gray-500">
                                Showing <span className="font-medium mx-1">1</span> to
                                <span className="font-medium mx-1">10</span> of
                                <span className="font-medium mx-1">20</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    1
                                </button>
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    2
                                </button>
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 分页部分后面添加趋势图和日历部分 */}
                    <div className="grid grid-cols-2 gap-6 mt-10 border-t border-gray-200 pt-8 bg-[#FAF8F8]">
                        {/* 搜索趋势图 */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">AGI Search Trends</h3>
                                <select className="text-sm border border-gray-200 rounded-md px-2 py-1">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last 3 months</option>
                                </select>
                            </div>
                            <div className="h-48">
                                <Line data={trendData} options={options} />
                            </div>
                        </div>

                        {/* 日历视图 */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Calendar</h3>
                                <div className="text-sm text-gray-600">
                                    {calendarData.month} {calendarData.year}
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarData.weekDays.map((day, index) => (
                                    <div key={day} className="text-center text-sm text-gray-600 py-1">
                                        {day}
                                    </div>
                                ))}
                                {calendarData.days.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`text-center py-1 text-sm ${day.isToday
                                                ? 'bg-blue-500 text-white rounded-lg'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {day.date}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
