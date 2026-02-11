import React from 'react';

interface PieChartSlice {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartSlice[];
    size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 200 }) => {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    let currentAngle = 0;

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(size / 2, size / 2, size / 2, endAngle);
        const end = polarToCartesian(size / 2, size / 2, size / 2, startAngle);
        const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            'M', size / 2, size / 2,
            'L', start.x, start.y,
            'A', size / 2, size / 2, 0, largeArc, 0, end.x, end.y,
            'Z'
        ].join(' ');
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    return (
        <div className="flex items-center gap-8">
            <svg width={size} height={size}>
                {data.map((slice, index) => {
                    const percentage = (slice.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const path = createArc(currentAngle, currentAngle + angle);
                    currentAngle += angle;

                    return (
                        <path
                            key={index}
                            d={path}
                            fill={slice.color}
                            className="transition-all duration-300 hover:opacity-80"
                        />
                    );
                })}
                {/* Center circle for donut effect */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 4}
                    fill="white"
                />
                <text
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dy=".3em"
                    className="text-2xl font-black fill-slate-900"
                >
                    {total}
                </text>
                <text
                    x={size / 2}
                    y={size / 2 + 20}
                    textAnchor="middle"
                    className="text-xs font-bold fill-slate-400 uppercase"
                >
                    TOTAL
                </text>
            </svg>

            <div className="space-y-3">
                {data.map((slice, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: slice.color }}
                        />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-900">{slice.label}</div>
                            <div className="text-xs text-slate-500">
                                {slice.value} ({((slice.value / total) * 100).toFixed(0)}%)
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
