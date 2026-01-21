import { Users, Building, Clock } from 'lucide-react';
import type { Stats } from '../../types';

interface StatCardsProps {
    stats: Stats;
}

const StatCards = ({ stats }: StatCardsProps) => {
    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: <Users size={32} />,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
        },
        {
            title: 'Halls Used',
            value: stats.hallsUsed,
            icon: <Building size={32} />,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
        },
        {
            title: 'Sessions',
            value: stats.sessions,
            icon: <Clock size={32} />,
            gradient: 'from-pink-500 to-pink-600',
            bgGradient: 'from-pink-50 to-pink-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className="card animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">
                                {card.title}
                            </p>
                            <p className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent">
                                <span className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                                    {card.value.toLocaleString()}
                                </span>
                            </p>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center`}>
                            <div className={`bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatCards;
