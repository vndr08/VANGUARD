"use client";

import { useEffect, useRef } from "react";

interface TruckIsometricProps {
  plate?: string;
  status?: "driving" | "idle" | "stop" | "offline";
  dim?: boolean;
  className?: string;
}

export default function TruckIsometric({
  plate = "B 1234 XYZ",
  status = "driving",
  dim = false,
  className = "",
}: TruckIsometricProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Animate wheels
    const rings = svgRef.current.querySelectorAll<SVGCircleElement>(".whl-ring");
    rings.forEach((ring) => {
      if (status === "driving") {
        ring.style.animation = "whl 0.7s linear infinite";
      } else {
        ring.style.animation = "none";
      }
    });

    // Animate beacon
    const beacon = svgRef.current.querySelector<SVGCircleElement>(".beacon");
    if (beacon) {
      beacon.style.animation = status !== "offline" ? "beacon 1.4s ease-in-out infinite" : "none";
    }
  }, [status]);

  const s = 1; // scale
  const W = 40;
  const x = 60;
  const y = 180;

  // Color palettes
  const cab = dim
    ? ["#5C6450", "#4A5144", "#3A4036"]
    : ["#FFC700", "#FFB300", "#E09E00"];
  const box = dim
    ? ["#3A4038", "#31362F", "#282D27"]
    : ["#F1F3EC", "#D4D8CC", "#B4B9AB"];
  const dk = dim
    ? ["#22261F", "#1B1F1A", "#14170F"]
    : ["#2B3230", "#202624", "#171B1A"];

  // Isometric projection helpers
  const ex = 0.866;
  const ez = -0.866;
  const P = (l: number, w: number, h: number): [number, number] => [
    x + l * ex + w * ez,
    y + (l + w) * 0.5 - h,
  ];

  // Box faces (top, right, left)
  const isoBox = (
    bx: number,
    by: number,
    L: number,
    H: number,
    D: number,
    colors: string[]
  ) => {
    const b0 = P(bx, by, 0);
    const b1 = P(bx + L, by, 0);
    const b2 = P(bx + L, by + D, 0);
    const b3 = P(bx, by + D, 0);
    const t0 = P(bx, by, H);
    const t1 = P(bx + L, by, H);
    const t2 = P(bx + L, by + D, H);
    const t3 = P(bx, by + D, H);

    return (
      <>
        {/* Top face */}
        <polygon
          points={`${t0[0].toFixed(1)},${t0[1].toFixed(1)} ${t1[0].toFixed(1)},${t1[1].toFixed(1)} ${t2[0].toFixed(1)},${t2[1].toFixed(1)} ${t3[0].toFixed(1)},${t3[1].toFixed(1)}`}
          fill={colors[0]}
        />
        {/* Right face */}
        <polygon
          points={`${b1[0].toFixed(1)},${b1[1].toFixed(1)} ${b2[0].toFixed(1)},${b2[1].toFixed(1)} ${t2[0].toFixed(1)},${t2[1].toFixed(1)} ${t1[0].toFixed(1)},${t1[1].toFixed(1)}`}
          fill={colors[1]}
        />
        {/* Left face */}
        <polygon
          points={`${b3[0].toFixed(1)},${b3[1].toFixed(1)} ${b2[0].toFixed(1)},${b2[1].toFixed(1)} ${t2[0].toFixed(1)},${t2[1].toFixed(1)} ${t3[0].toFixed(1)},${t3[1].toFixed(1)}`}
          fill={colors[2]}
        />
      </>
    );
  };

  // Wheel positions
  const wheelPositions = [
    { l: 28 },
    { l: 46 },
    { l: 96 },
    { l: 122 },
  ];

  const renderWheel = (l: number) => {
    const cx = x + 0.866 * (l - W);
    const cy = y + 0.5 * (l + W) + 2.5;
    return (
      <g key={l}>
        <ellipse
          cx={cx.toFixed(1)}
          cy={cy.toFixed(1)}
          rx={10 * s}
          ry={6 * s}
          fill="#0E1110"
          stroke="#000"
          strokeOpacity={0.4}
        />
        <ellipse
          className="whl-ring"
          cx={cx.toFixed(1)}
          cy={cy.toFixed(1)}
          rx={5.2 * s}
          ry={3.1 * s}
          fill="none"
          stroke="#6E7972"
          strokeWidth={1.6}
          strokeDasharray="3.4 3"
        />
      </g>
    );
  };

  // Headlight position
  const hlX = x + 132 * 0.866 + 1;
  const hlY = y + 66 - 8 - 6;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 240"
      className={`truck-isometric ${className}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <style>{`
          .whl-ring {
            animation: whl 0.7s linear infinite;
            transform-origin: center;
          }
          @keyframes whl {
            to {
              stroke-dashoffset: -13;
            }
          }
          .beacon {
            animation: beacon 1.4s ease-in-out infinite;
          }
          @keyframes beacon {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 1; }
          }
          .hl {
            filter: drop-shadow(0 0 6px rgba(255, 197, 0, 0.8));
          }
          @media (prefers-reduced-motion: reduce) {
            .whl-ring, .beacon {
              animation: none;
            }
          }
        `}</style>
        <filter id="truck-shadow">
          <feDropShadow dx={0} dy={4} stdDeviation={3} floodOpacity={0.4} />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx={x + 66}
        cy={y + 62}
        rx={95 * s}
        ry={20 * s}
        fill="rgba(0,0,0,0.25)"
        filter="url(#truck-shadow)"
      />

      {/* Chassis */}
      {isoBox(x, y - 7, 132, 7, W, dk)}

      {/* Cargo box */}
      {isoBox(x, y - 14, 92, W, 52, box)}

      {/* Roof detail */}
      <polygon
        points={`${(x + 2).toFixed(1)},${(y - 14 - 52 + 5).toFixed(1)} ${(x + 90).toFixed(1)},${(y - 14 - 52 + 5).toFixed(1)} ${(x + 90).toFixed(1)},${(y - 14 - 52 + 8).toFixed(1)} ${(x + 2).toFixed(1)},${(y - 14 - 52 + 8).toFixed(1)}`}
        fill="#8E9488"
      />

      {/* Cab */}
      {isoBox(x + 98, y - 8, 32, W, 34, cab)}

      {/* Cab windshield */}
      <polygon
        points={`${(x + 130 * 0.866 - 40 * 0.866).toFixed(1)},${(y + 130 * 0.5 + 40 * 0.5 - 8 - 34).toFixed(1)} ${(x + 132 * 0.866 - 40 * 0.866).toFixed(1)},${(y + 132 * 0.5 + 40 * 0.5 - 8 - 30).toFixed(1)} ${(x + 132 * 0.866).toFixed(1)},${(y + 132 * 0.5 - 8 - 30).toFixed(1)} ${(x + 130 * 0.866).toFixed(1)},${(y + 130 * 0.5 - 8 - 34).toFixed(1)}`}
        fill={dim ? "#10140F" : "#26302E"}
      />

      {/* Wheels */}
      {wheelPositions.map(({ l }) => renderWheel(l))}

      {/* Beacon light */}
      <circle
        className="beacon"
        cx={(x + 94.5).toFixed(1)}
        cy={(y - 28).toFixed(1)}
        r={3.4 * s}
        fill={dim ? "#5C4A00" : "#FFB000"}
      />

      {/* Headlight */}
      <polygon
        className="hl"
        points={`${(hlX).toFixed(1)},${(hlY).toFixed(1)} ${(hlX + 6).toFixed(1)},${(hlY + 3.5).toFixed(1)} ${(hlX + 6).toFixed(1)},${(hlY + 8.5).toFixed(1)} ${(hlX).toFixed(1)},${(hlY + 5).toFixed(1)}`}
        fill={dim ? "#4a4420" : "#FFF3B0"}
      />

      {/* License plate */}
      <g transform={`translate(${x + 100}, ${y - 10})`}>
        <rect
          x={0}
          y={0}
          width={26}
          height={12}
          rx={1}
          fill="#1A1A1A"
          stroke="#333"
          strokeWidth={0.5}
        />
        <text
          x={13}
          y={9}
          textAnchor="middle"
          fontSize={5}
          fontFamily="var(--font-mono, monospace)"
          fontWeight="600"
          fill="#FFF"
        >
          {plate.slice(0, 12)}
        </text>
      </g>
    </svg>
  );
}
