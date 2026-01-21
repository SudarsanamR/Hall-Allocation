import type { Stats } from '../../types';

interface StatCardsProps {
    stats: Stats;
}

const StatCards = ({ stats }: StatCardsProps) => {
    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Halls Used',
            value: stats.hallsUsed,
            gradient: 'from-purple-500 to-purple-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className="card animate-fade-in p-6"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            {card.title}
                        </p>
                        <p className="text-4xl font-bold">
                            <span className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                                {card.value.toLocaleString()}
                            </span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatCards;
