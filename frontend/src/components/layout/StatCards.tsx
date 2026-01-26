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
            details: stats.departmentBreakdown,
        },
        {
            title: 'Halls Used',
            value: stats.hallsUsed,
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Subjects',
            value: Object.keys(stats.subjectBreakdown || {}).length,
            gradient: 'from-emerald-500 to-emerald-600',
            details: stats.subjectBreakdown,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {/* Department Breakdown */}
                    {card.details && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(card.details).map(([dept, count]) => (
                                <span key={dept} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                    {dept}: {count}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StatCards;
