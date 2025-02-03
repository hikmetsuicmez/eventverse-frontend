import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ size = 32 }) => {
  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      sx={{
        display: 'inline-block',
        verticalAlign: 'middle',
        fill: 'none',
        mr: 1
      }}
    >
      {/* Etkinlik sembolü - E harfi stilize edilmiş */}
      <path
        d="M8 6h16v4H12v6h10v4H12v6h16v4H8V6z"
        fill="url(#gradient)"
        style={{
          animation: 'float 3s ease-in-out infinite'
        }}
      />
      
      {/* Parlama efekti */}
      <circle
        cx="24"
        cy="8"
        r="2"
        fill="#fff"
        style={{
          animation: 'glow 2s ease-in-out infinite'
        }}
      />

      {/* Gradient tanımı */}
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2196F3" />
          <stop offset="100%" stopColor="#90CAF9" />
        </linearGradient>
      </defs>

      {/* Animasyonlar */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }
          @keyframes glow {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Logo; 