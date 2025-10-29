import React from 'react';
import Header from '../components/Header';
import { StarIcon } from '../components/Icons';

const testimonials = [
  { name: 'Alex Johnson', role: 'Student', text: "Smart Noter changed the way I study. The AI summaries are a lifesaver for exam prep!", rating: 5 },
  { name: 'Maria Garcia', role: 'Project Manager', text: "I can finally focus on the meeting instead of scrambling to take notes. The action item extraction is brilliant.", rating: 5 },
  { name: 'David Chen', role: 'Researcher', text: "Being able to transcribe hours of interviews and then chat with the content is incredibly powerful for my work.", rating: 5 },
];

// FIX: Resolved key prop type error by defining props with a type alias and using React.FC.
type TestimonialCardProps = {
    name: string;
    role: string;
    text: string;
    rating: number;
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, text, rating }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-2">
            {[...Array(rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
        </div>
        <p className="text-gray-700 mb-4">"{text}"</p>
        <div>
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);


const TestimonialScreen: React.FC = () => {
    return (
        <div className="bg-orange-500 min-h-full">
            <Header title="What Users Say" theme="orange" />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-140px)]">
                <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default TestimonialScreen;