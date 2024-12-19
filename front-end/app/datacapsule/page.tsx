'use client';

import Image from 'next/image';
import { Star, Clock, Users, ChevronDown, BarChart2 } from 'lucide-react';

const popularCourses = [
  {
    id: 1,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Sarah Johnson',
    rating: 4.8,
    students: 1234,
    duration: '6h 30m',
    image: 'https://picsum.photos/seed/course1/400/250',
    category: 'Design',
  },
  {
    id: 2,
    title: 'Advanced Web Development',
    instructor: 'Mike Chen',
    rating: 4.9,
    students: 2156,
    duration: '8h 45m',
    image: 'https://picsum.photos/seed/course2/400/250',
    category: 'IT & Software',
  },
  {
    id: 3,
    title: 'Digital Marketing Strategy',
    instructor: 'Emily Brown',
    rating: 4.7,
    students: 1879,
    duration: '5h 15m',
    image: 'https://picsum.photos/seed/course3/400/250',
    category: 'Marketing',
  },
  {
    id: 4,
    title: 'Data Science Essentials',
    instructor: 'David Wilson',
    rating: 4.9,
    students: 2467,
    duration: '10h 20m',
    image: 'https://picsum.photos/seed/course4/400/250',
    category: 'IT & Software',
  },
];

const categories = [
  'All',
  'IT & Software',
  'Design',
  'Marketing',
  'Business',
  'Interior',
];

export default function CoursesPage() {
  return (
    <div className="flex gap-6 p-6 bg-[#FAF8F8] min-h-screen">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Data Capsule Powered by AI</h1>
            <p className="text-sm text-gray-500 mt-1">Explore Your Data Capsule</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
              <span>This Year</span>
              <ChevronDown className="w-4 h-4" />
            </button>
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
          <h2 className="text-xl font-semibold mb-4">Most Popular</h2>
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
                  <p className="text-gray-600 text-sm mb-3">{course.instructor}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{course.students}</span>
                    </div>
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
              <h4 className="font-medium mb-2">Learning Hours</h4>
              <p className="text-2xl font-bold text-[#14142B]">32.5h</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            
            <div className="p-4 rounded-lg bg-[#E0FFE0]">
              <h4 className="font-medium mb-2">Courses Completed</h4>
              <p className="text-2xl font-bold text-green-700">12</p>
              <p className="text-sm text-gray-600">Out of 15 enrolled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Activity</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">View All</button>
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <BarChart2 className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </aside>
    </div>
  );
}
