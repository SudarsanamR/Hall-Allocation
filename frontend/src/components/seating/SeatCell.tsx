
import type { Seat } from '../../types';

interface SeatCellProps {
    seat: Seat;
    colorMap: Map<string, string>;
    isHighlighted?: boolean;
    isMasked?: boolean;
}

const SeatCell = ({ seat, colorMap, isHighlighted, isMasked }: SeatCellProps) => {
    if (!seat.student) {
        return (
            <div className="relative group w-full aspect-square flex items-center justify-center">
                <div className="w-[80%] h-[80%] border-2 border-gray-200 rounded-t-lg rounded-b-sm opacity-50 transition-all group-hover:border-primary-300 group-hover:scale-105"></div>
                <span className="absolute text-[8px] text-gray-300 font-medium">{seat.row + 1}-{seat.col + 1}</span>
            </div>
        );
    }

    const key = seat.subject || seat.department || 'default';
    // Mapping bg colors to lighter shades for seat body
    const baseColor = colorMap.get(key) || 'bg-gray-200 text-gray-800';

    return (
        <div className={`relative group w-full aspect-square flex items-center justify-center cursor-pointer p-0.5 ${isHighlighted ? 'z-20' : ''}`}>



            {/* Seat Shape */}
            <div
                className={`
                    w-full h-full 
                    ${isMasked ? 'bg-gray-200 text-gray-400' : baseColor}
                    rounded-t-xl rounded-b-md 
                    shadow-sm ${!isMasked && 'group-hover:shadow-md'}
                    transform transition-all duration-200 ${!isMasked && 'group-hover:-translate-y-1 group-hover:scale-105'}
                    flex flex-col items-center justify-center
                    border-b-4 border-black/10
                    ${isHighlighted ? 'ring-2 ring-primary-600 ring-offset-2 scale-110' : ''}
                `}
            >
                <div className="w-8 h-1 bg-black/5 rounded-full mb-1"></div>
                <span className="text-[10px] font-bold truncate px-1 max-w-full">
                    {isMasked ? '• • •' : seat.student.registerNumber.slice(-3)}
                </span>
            </div>

            {/* Hover Tooltip - Movie Style (Only if not masked) */}
            {!isMasked && (
                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs ${isHighlighted ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700`}>
                    <div className="font-bold text-sm mb-0.5 text-primary-300">{seat.student.registerNumber}</div>
                    <div className="text-gray-300">{seat.student.department} • {seat.student.subjectCode}</div>
                    <div className="text-gray-400 mt-1 pt-1 border-t border-gray-700 flex justify-between gap-4">
                        <span>Row: {seat.row + 1}</span>
                        <span>Seat: {seat.col + 1}</span>
                    </div>
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                </div>
            )}
        </div>
    );
};

export default SeatCell;
