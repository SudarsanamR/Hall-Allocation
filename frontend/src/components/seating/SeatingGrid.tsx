
import SeatCell from './SeatCell';
import type { HallSeating } from '../../types';

interface SeatingGridProps {
    hallSeating: HallSeating;
    colorMap: Map<string, string>;
    highlightStudentId?: string;
    selectedDepts?: string[];
    selectedSubjects?: string[];
}

const SeatingGrid = ({
    hallSeating,
    colorMap,
    highlightStudentId,
    selectedDepts,
    selectedSubjects
}: SeatingGridProps) => {
    const { hall, grid, studentsCount } = hallSeating;

    return (
        <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            {/* ... Header ... */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {hall.name}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            {hall.block}
                        </span>
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Occupancy: <span className="font-medium text-gray-900 dark:text-white">{studentsCount}</span> / {hall.capacity}
                    </p>
                </div>
            </div>

            {/* Screen Indicator */}
            <div className="flex justify-center mb-8 relative px-2">
                <div className="w-full md:w-2/3 h-8 md:h-10 bg-gradient-to-b from-primary-100 to-white dark:from-primary-900/40 dark:to-gray-900 transform -perspective-x-12 rounded-t-[50%] opacity-50 flex items-end justify-center pb-1 border-t-4 border-primary-200 dark:border-primary-700 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]">
                    <span className="text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.3em] font-semibold text-primary-400 dark:text-primary-300 whitespace-nowrap">BLACKBOARD / STAGE</span>
                </div>
            </div>

            {/* Seating Layout */}
            <div className="overflow-x-auto pb-4 custom-scrollbar flex justify-center">
                <div
                    className="grid gap-x-3 gap-y-4 min-w-min p-4 md:p-8"
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
                                isHighlighted={highlightStudentId && seat.student ? seat.student.registerNumber === highlightStudentId : false}
                                isMasked={!!highlightStudentId && !!seat.student && seat.student.registerNumber !== highlightStudentId}
                                selectedDepts={selectedDepts}
                                selectedSubjects={selectedSubjects}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeatingGrid;
