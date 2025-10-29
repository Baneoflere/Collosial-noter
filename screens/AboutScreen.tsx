import React from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { QuillIcon } from '../components/Icons';

const AboutScreen: React.FC = () => {
    const { dispatch } = useAppContext();

    return (
        <div className="bg-gray-900 min-h-full text-white">
            <Header 
                title="About Nota AI" 
                theme="gray" 
                showBackButton 
                onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'profile' })} 
            />
            <main className="p-6 space-y-8">
                <section className="text-center">
                    <QuillIcon className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Nota AI</h1>
                    <p className="text-lg text-gray-300 mt-2">Your Intelligent Note-Taking Companion</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-gray-100 border-b-2 border-blue-400 pb-2">Our Mission</h2>
                    <p className="text-gray-400 leading-relaxed">
                        At Nota AI, our mission is to unlock the world's spoken knowledge. We believe that great ideas are often shared in conversations, lectures, and meetings, but are too easily lost. We build intelligent tools to help you capture, understand, and act on that knowledge, transforming transient words into a permanent, searchable, and interactive library of your life's most important moments.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-3 text-gray-100 border-b-2 border-blue-400 pb-2">Our Team</h2>
                    <div className="bg-gray-800/70 rounded-xl p-4">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c710?q=80&w=800&auto=format&fit=crop" 
                            alt="Nota AI Team"
                            className="rounded-lg w-full h-48 object-cover mb-4"
                        />
                        <p className="text-gray-400 leading-relaxed">
                            We are a passionate team of engineers, designers, and AI researchers dedicated to building the future of note-taking. We're driven by the challenge of creating a product that is not only powerful but also intuitive and delightful to use.
                        </p>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-3 text-gray-100 border-b-2 border-blue-400 pb-2">Contact Us</h2>
                    <div className="bg-gray-800/70 rounded-xl p-4 text-gray-300">
                        <p>Have questions, feedback, or just want to say hello?</p>
                        <a href="mailto:hello@nota.ai" className="text-blue-400 hover:underline font-semibold">
                            hello@nota.ai
                        </a>
                        <p className="mt-2 text-sm text-gray-500">
                            We'd love to hear from you!
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutScreen;