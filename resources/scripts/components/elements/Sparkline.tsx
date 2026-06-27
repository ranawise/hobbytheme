import React from 'react';

interface Props {
    id: string;
    data: number[];   // values already normalised 0–100
    color: string;
    width?: number;
    height?: number;
}

const Sparkline = ({ id, data, color, width = 64, height = 26 }: Props) => {
    const gradId = `sg-${id}`;

    if (data.length < 2) {
        return (
            <svg width={width} height={height} style={{ flexShrink: 0, display: 'block' }}>
                <line
                    x1={0} y1={height - 2}
                    x2={width} y2={height - 2}
                    stroke={'rgba(255,255,255,0.08)'}
                    strokeWidth={1}
                />
            </svg>
        );
    }

    const pad = 2; // vertical padding so the line isn't clipped at edges
    const innerH = height - pad * 2;

    const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * width,
        y: pad + innerH - (Math.min(100, Math.max(0, v)) / 100) * innerH,
    }));

    // Smooth cubic bezier: control points are the midpoint x between neighbours
    const linePath = pts
        .map((pt, i) => {
            if (i === 0) return `M ${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
            const prev = pts[i - 1];
            const cpx = ((prev.x + pt.x) / 2).toFixed(2);
            return `C ${cpx},${prev.y.toFixed(2)} ${cpx},${pt.y.toFixed(2)} ${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
        })
        .join(' ');

    const last = pts[pts.length - 1];
    const first = pts[0];
    const areaPath = `${linePath} L ${last.x.toFixed(2)},${height} L ${first.x.toFixed(2)},${height} Z`;

    return (
        <svg width={width} height={height} style={{ flexShrink: 0, display: 'block' }}>
            <defs>
                <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={color} stopOpacity='0.22' />
                    <stop offset='100%' stopColor={color} stopOpacity='0' />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradId})`} />
            <path
                d={linePath}
                fill='none'
                stroke={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default Sparkline;
