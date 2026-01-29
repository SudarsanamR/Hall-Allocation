
import type { Seat } from '../../types';

interface SeatCellProps {
    seat: Seat;
    colorMap: Map<string, string>;
    isHighlighted?: boolean;
    isMasked?: boolean;
    selectedDepts?: string[];
    selectedSubjects?: string[];
}

const SeatCell = ({
    seat,
    colorMap,
    isHighlighted,
    isMasked,
    selectedDepts,
    selectedSubjects
}: SeatCellProps) => {
    if (!seat.student) {
        return (
            <div className="relative group w-full aspect-square flex items-center justify-center">
                <div className="w-[80%] h-[80%] border-2 border-gray-200 rounded-t-lg rounded-b-sm opacity-50 transition-all group-hover:border-primary-300 group-hover:scale-105"></div>
                <span className="absolute text-[8px] text-gray-300 font-medium">{seat.seatNumber ?? `${seat.row + 1}-${seat.col + 1}`}</span>
            </div>
        );
    }

    // Determine if Dimmed (Filtered out)
    // Dimmed if filters exist AND student doesn't match
    // Determine if Dimmed (Filtered out)
    // Dimmed if filters exist AND student doesn't match
    const isDimmed = (() => {
        if ((!selectedDepts || selectedDepts.length === 0) && (!selectedSubjects || selectedSubjects.length === 0)) return false;

        const deptMatch = !selectedDepts || selectedDepts.length === 0 || selectedDepts.includes(seat.student.department);
        // Use seat.subject (full string) to match selectedSubjects keys
        const subjMatch = !selectedSubjects || selectedSubjects.length === 0 || (seat.subject && selectedSubjects.includes(seat.subject));

        return !(deptMatch && subjMatch);
    })();

    const key = seat.student.department || 'default';
    // Mapping bg colors to lighter shades for seat body
    const baseColor = isDimmed
        ? 'bg-gray-100 text-gray-300 border-gray-200'
        : (colorMap.get(key) || 'bg-gray-200 text-gray-800');

    return (
        <div className={`relative group w-full aspect-square flex items-center justify-center cursor-pointer p-1.5 ${isHighlighted ? 'z-20' : 'z-10'} hover:z-30`}>
            {/* Seat Shape */}
            <div
                className={`
                    w-full h-full 
                    ${isMasked ? 'bg-gray-200 text-gray-400' : baseColor}
                    rounded-t-xl rounded-b-md 
                    shadow-sm ${!isMasked && !isDimmed && 'group-hover:shadow-md'}
                    transform transition-all duration-200 ${!isMasked && !isDimmed && 'group-hover:-translate-y-1 group-hover:scale-105'}
                    flex flex-col items-center justify-center
                    border-b-4 ${isDimmed ? 'border-gray-200' : 'border-black/10'}
                    ${isHighlighted ? 'ring-2 ring-primary-600 ring-offset-2 scale-110' : ''}
                    ${isDimmed ? 'opacity-60' : ''}
                `}
            >
                <div className={`w-8 h-1 ${isDimmed ? 'bg-gray-200' : 'bg-black/5'} rounded-full mb-1`}></div>
                <span className={`text-[10px] sm:text-xs md:text-sm font-bold truncate px-0.5 md:px-1 max-w-full ${isDimmed ? 'text-gray-400' : ''}`}>
                    {isMasked ? '• • •' : seat.student.registerNumber.slice(-3)}
                </span>
            </div>

            {/* Hover Tooltip - Movie Style (Only if not masked) */}
            {/* Hover Tooltip - Movie Style (Only if not masked) */}
            {!isMasked && (
                <div
                    className={`
                        absolute left-1/2 -translate-x-1/2 
                        ${seat.row < 2 ? 'top-full mt-2' : 'bottom-full mb-2'}
                        bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs 
                        opacity-0 group-hover:opacity-100 
                        pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700
                    `}
                >
                    <div className="font-bold text-sm mb-0.5 text-primary-300">{seat.student.registerNumber}</div>
                    <div className="text-gray-300">{seat.student.department} • {seat.student.subjectCode}</div>
                    <div className="text-gray-400 mt-1 pt-1 border-t border-gray-700 flex justify-between gap-4">
                        {seat.seatNumber ? (
                            <span className="font-semibold text-primary-400">Seat: {seat.seatNumber}</span>
                        ) : (
                            <>
                                <span>Row: {seat.row + 1}</span>
                                <span>Seat: {seat.col + 1}</span>
                            </>
                        )}
                    </div>
                    {/* Arrow */}
                    <div
                        className={`
                            absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 
                            ${seat.row < 2
                                ? 'top-[-5px] border-l border-t border-gray-700'
                                : 'bottom-[-5px] border-r border-b border-gray-700'
                            }
                        `}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default SeatCell;
