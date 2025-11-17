import React, { useEffect, useState } from 'react';
import { Broadcast } from '../../types';
import { getBroadcasts, addBroadcast } from '../../services/api';
import { Megaphone, PlusCircle } from 'lucide-react';

const BroadcastForm: React.FC<{
    onSubmit: (broadcast: Omit<Broadcast, 'broadcastId' | 'postDate'>) => void;
    onClose: () => void;
}> = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, content });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">New Broadcast Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border-gray-300 rounded-md" required />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message Content" className="w-full border-gray-300 rounded-md" rows={5} required />
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Publish Broadcast</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Broadcasts: React.FC = () => {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        const data = await getBroadcasts();
        setBroadcasts(data.sort((a,b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime()));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = async (broadcast: Omit<Broadcast, 'broadcastId' | 'postDate'>) => {
        await addBroadcast(broadcast);
        setShowForm(false);
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Broadcasts & Announcements</h1>
                 <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>New Broadcast</span>
                </button>
            </div>

            {showForm && <BroadcastForm onSubmit={handleFormSubmit} onClose={() => setShowForm(false)} />}
            
            <div className="space-y-4">
                {broadcasts.map(b => (
                    <div key={b.broadcastId} className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Megaphone className="text-brand-primary"/>
                                {b.title}
                            </h2>
                            <p className="text-sm text-brand-text">{new Date(b.postDate).toLocaleDateString()}</p>
                        </div>
                       
                        <p className="mt-4 text-brand-text">{b.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Broadcasts;
