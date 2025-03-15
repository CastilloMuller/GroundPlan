import React from 'react';

export default function GrondplanStructure() {
  const width = 400;
  const height = 300;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="border border-gray-300 bg-white"
    >
      {/* Outer structure */}
      <rect
        x="10"
        y="10"
        width={width - 20}
        height={height - 20}
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Side labels */}
      <text x={width / 2} y="5" textAnchor="middle" fontSize="20" fill="black">A</text>
      <text x={width - 5} y={height / 2} textAnchor="end" fontSize="20" fill="black">B</text>
      <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="20" fill="black">C</text>
      <text x="5" y={height / 2} textAnchor="start" fontSize="20" fill="black">D</text>

      {/* Corner labels */}
      <text x="5" y="20" textAnchor="start" fontSize="20" fill="black">E</text>
      <text x={width - 5} y="20" textAnchor="end" fontSize="20" fill="black">F</text>
      <text x={width - 5} y={height - 5} textAnchor="end" fontSize="20" fill="black">G</text>
      <text x="5" y={height - 5} textAnchor="start" fontSize="20" fill="black">H</text>
    </svg>
  );
}

