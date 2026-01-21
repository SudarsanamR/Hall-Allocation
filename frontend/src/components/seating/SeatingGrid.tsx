
import SeatCell from './SeatCell';
import type { HallSeating } from '../../types';

interface SeatingGridProps {
    hallSeating: HallSeating;
    colorMap: Map<string, string>;
}

const SeatingGrid = ({ hallSeating, colorMap }: SeatingGridProps) => {
    const { hall, grid, studentsCount } = hallSeating;

    return (
        <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            {/* Hall Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {hall.name}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            Block {hall.block}
                        </span>
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Occupancy: <span className="font-medium text-gray-900 dark:text-white">{studentsCount}</span> / {hall.capacity}
                    </p>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 rounded-t-sm rounded-b-[2px]"></div>
                        Available
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-200 dark:bg-green-800/50 rounded-t-sm rounded-b-[2px] border-b-2 border-green-300 dark:border-green-600"></div>
                        Booked
                    </div>
                </div>
            </div>

            {/* Screen Indicator */}
            <div className="flex justify-center mb-8 relative">
                <div className="w-2/3 h-8 bg-gradient-to-b from-primary-100 to-white dark:from-primary-900/40 dark:to-gray-900 transform -perspective-x-12 rounded-t-[50%] opacity-50 flex items-end justify-center pb-1 border-t-4 border-primary-200 dark:border-primary-700 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]">
                    <span className="text-xs tracking-[0.3em] font-semibold text-primary-400 dark:text-primary-300">BLACKBOARD / STAGE</span>
                </div>
            </div>

            {/* Seating Layout */}
            <div className="overflow-x-auto pb-4 custom-scrollbar flex justify-center">
                <div
                    className="grid gap-x-3 gap-y-4 min-w-min px-4 md:px-8"
                    style={{
                        gridTemplateColumns: `repeat(${hall.columns}, minmax(40px, 1fr))`,
                    }}
                >
                    {grid.map((row, rowIndex) =>
                        row.map((seat, colIndex) => (
                            <SeatCell
                                key={`${rowIndex}-${colIndex}`}
                                seat={seat}
                                colorMap={colorMap}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Legend Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 px-6 py-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {Array.from(colorMap.entries()).map(([key, color]) => (
                        <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            <div className={`w-3 h-3 rounded-full ${color}`} />
                            <span className="text-xs font-medium text-gray-700">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SeatingGrid;
