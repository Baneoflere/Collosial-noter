import React from 'react';
import Header from '../components/Header';
import { StarIcon } from '../components/Icons';

const testimonials = [
  { name: 'Dr. Evelyn Reed', role: 'University Professor', text: "Nota AI has revolutionized my research workflow. Transcribing interviews used to take days; now it takes minutes. The ability to chat with my data is a game-changer.", rating: 5, avatar: "https://i.pravatar.cc/150?img=32" },
  { name: 'Alex Johnson', role: 'College Student', text: "This app is a lifesaver for exam prep. I can record lectures and instantly get summaries and flashcards. My grades have genuinely improved.", rating: 5, avatar: "https://i.pravatar.cc/150?img=5" },
  { name: 'Maria Garcia', role: 'Project Manager', text: "I can finally focus on the meeting instead of scrambling to take notes. The action item extraction is brilliant and keeps my team aligned.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1" },
  { name: 'Kenji Tanaka', role: 'Software Developer', text: "As someone who attends a lot of technical meetups, being able to quickly capture and search through notes is invaluable. The accuracy of the transcription for technical jargon is surprisingly good.", rating: 4, avatar: "https://i.pravatar.cc/150?img=11" },
  { name: 'Jamal Williams', role: 'Entrepreneur', text: "From brainstorming sessions to investor pitches, Nota AI is my second brain. It helps me organize my thoughts and never miss a beat.", rating: 5, avatar: "https://i.pravatar.cc/150?img=60" },
];

type TestimonialCardProps = {
    name: string;
    role: string;
    text: string;
    rating: number;
    avatar: string;
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, text, rating, avatar }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
            <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>
        <p className="text-gray-700 mb-4">"{text}"</p>
        <div className="flex items-center">
            {[...Array(rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
        </div>
    </div>
);


const TestimonialScreen: React.FC = () => {
    return (
        <div className="bg-orange-500 min-h-full">
            <Header title="What Users Say" theme="orange" />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-140px)]">
                <div className="text-center py-6 px-4">
                    <h2 className="text-3xl font-extrabold text-gray-800">Trusted by 4 Million+ Users</h2>
                    <p className="text-gray-500 mt-2">See why students, professionals, and lifelong learners love Nota AI.</p>
                </div>
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