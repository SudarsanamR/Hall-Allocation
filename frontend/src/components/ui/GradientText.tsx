

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
    yoyo?: boolean; // New prop: if false, animation restarts from 0
}

export default function GradientText({
    children,
    className = "",
    colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
    animationSpeed = 8,
    showBorder = false,
    yoyo = true, // Default to true to keep existing behavior unless specified
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        backgroundSize: "300% 100%", // Enlarged to allow movement
        animationDuration: `${animationSpeed}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: yoyo ? "alternate" : "normal", // yoyo control
    };

    return (
        <div
            className={`relative flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${className}`}
        >
            {showBorder && (
                <div
                    className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
                    style={{
                        ...gradientStyle,
                        backgroundSize: "300% 100%",
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
                        style={{
                            width: "calc(100% - 2px)",
                            height: "calc(100% - 2px)",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    ></div>
                </div>
            )}

            <div
                className="inline-block relative z-2 text-transparent bg-cover animate-gradient bg-clip-text"
                style={{
                    ...gradientStyle,
                }}
            >
                {children}
            </div>

            {/* Required Keyframes for Tailwind/CSS module usage isn't always available, so injecting style here for simplicity */}
            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* If yoyo=false, we likely want a continuous scrolling effect */
        @keyframes gradient-normal {
           0% { background-position: 0% 50%; }
           100% { background-position: 100% 50%; }
        }
        .animate-gradient {
            animation-name: ${yoyo ? 'gradient' : 'gradient-normal'};
        }
      `}</style>
        </div>
    );
}
