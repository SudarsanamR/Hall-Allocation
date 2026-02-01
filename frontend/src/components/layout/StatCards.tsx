import type { Stats } from '../../types';

interface StatCardsProps {
    stats: Stats;
    selectedDepts: string[];
    selectedSubjects: string[];
    selectedBlocks?: string[];
    onToggleDept: (dept: string) => void;
    onToggleSubject: (subj: string) => void;
    onToggleBlock?: (block: string) => void;
    onSelectAllSubjects?: () => void;
    onSelectAllBlocks?: () => void;
    colorMap: Map<string, string>;
}

const StatCards = ({
    stats,
    selectedDepts,
    selectedSubjects,
    selectedBlocks = [],
    onToggleDept,
    onToggleSubject,
    onToggleBlock,
    onSelectAllSubjects,
    onSelectAllBlocks,
    colorMap
}: StatCardsProps) => {

    // Helper to get color style
    const getBadgeStyle = (key: string, isSelected: boolean, defaultColor: string) => {
        if (!isSelected) {
            return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
        }
        // Use mapped color if available, else default gradient/style
        // Determine if colorMap value is a Tailwind class string
        const mappedClass = colorMap.get(key);
        if (mappedClass) {
            return `${mappedClass} cursor-pointer shadow-sm ring-1 ring-black/5 dark:ring-white/10`;
        }
        return `bg-gradient-to-r ${defaultColor} text-white cursor-pointer shadow-md`;
    };

    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            gradient: 'from-blue-500 to-blue-600',
            details: stats.departmentBreakdown,
            isDept: true,
        },
        {
            title: 'Halls Used',
            value: stats.hallsUsed,
            gradient: 'from-purple-500 to-purple-600',
            details: stats.blockBreakdown,
            isBlock: true,
        },
        {
            title: 'Subjects',
            value: Object.keys(stats.subjectBreakdown || {}).length,
            gradient: 'from-emerald-500 to-emerald-600',
            details: stats.subjectBreakdown,
            isSubject: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className="card animate-fade-in p-6 relative overflow-hidden group"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Background Glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500 pointer-events-none`} />

                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            {card.title}
                        </p>
                        <p className="text-4xl font-bold mb-4">
                            <span className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                                {card.value.toLocaleString()}
                            </span>
                        </p>
                    </div>

                    {/* Department / Subject Badges (Interactive) */}
                    {card.details && (
                        <div className="flex flex-wrap gap-2">
                            {/* Add "All" Button for Subjects if handler provided */}
                            {card.isSubject && onSelectAllSubjects && (
                                <button
                                    onClick={onSelectAllSubjects}
                                    className={`
                                        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
                                        border transition-all duration-200 select-none
                                        ${getBadgeStyle('All', selectedSubjects.length === Object.keys(card.details || {}).length, card.gradient)}
                                    `}
                                >
                                    Select All
                                </button>
                            )}

                            {/* Add "All" Button for Blocks if handler provided */}
                            {(card as any).isBlock && onSelectAllBlocks && (
                                <button
                                    onClick={onSelectAllBlocks}
                                    className={`
                                        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
                                        border transition-all duration-200 select-none
                                        ${getBadgeStyle('All', selectedBlocks.length === Object.keys(card.details || {}).length, card.gradient)}
                                    `}
                                >
                                    Select All
                                </button>
                            )}

                            {Object.entries(card.details).map(([key, count]) => {
                                // Assume key is Dept Name or Subject Code
                                const isSelected = card.isDept
                                    ? selectedDepts.includes(key)
                                    : card.isSubject
                                        ? selectedSubjects.includes(key)
                                        : (card as any).isBlock && selectedBlocks
                                            ? selectedBlocks.includes(key)
                                            : false;

                                const toggle = () => {
                                    if (card.isDept) onToggleDept(key);
                                    if (card.isSubject) onToggleSubject(key);
                                    if ((card as any).isBlock && onToggleBlock) onToggleBlock(key);
                                };

                                return (
                                    <button
                                        key={key}
                                        onClick={toggle}
                                        className={`
                                            inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
                                            border transition-all duration-200 select-none
                                            ${getBadgeStyle(key, isSelected, card.gradient)}
                                        `}
                                    >
                                        {key}
                                        <span className="ml-1.5 opacity-80">
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StatCards;
