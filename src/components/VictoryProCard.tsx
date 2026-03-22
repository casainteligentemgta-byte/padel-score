'use client';

import React from 'react';

export type VictoryProCardProps = {
  /** Nombre del torneo (ej. "Torneo Open Smart Padel - 4ta Categoría") */
  tournamentName: string;
  /** Pareja ganadora: nombres y foto (opcional) */
  winnerTeam: { name: string; photoUrl?: string | null }[];
  /** Pareja perdedora: nombres y foto (opcional) */
  loserTeam: { name: string; photoUrl?: string | null }[];
  /** Resultado por sets (ej. "6-4 / 7-5") */
  score: string;
  /** Dato destacado (ej. "Salvaron 4 match points en el segundo set.") */
  highlight?: string | null;
  /** Ancho en px (por defecto 1080 para export) */
  width?: number;
  /** Alto en px (por defecto 1080) */
  height?: number;
  /** Clase extra para el contenedor */
  className?: string;
};

const defaultPhoto = 'https://via.placeholder.com/250';

export function VictoryProCard({
  tournamentName,
  winnerTeam,
  loserTeam,
  score,
  highlight,
  width = 1080,
  height = 1080,
  className = '',
}: VictoryProCardProps) {
  const winnerNames = winnerTeam.map(p => p.name).join(' / ');
  const loserNames = loserTeam.map(p => p.name).join(' / ');
  const winnerPhoto = winnerTeam[0]?.photoUrl || winnerTeam[1]?.photoUrl || defaultPhoto;
  const loserPhoto = loserTeam[0]?.photoUrl || loserTeam[1]?.photoUrl || defaultPhoto;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#0a0a0a',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '10px solid #ccff00',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            color: '#ccff00',
            fontSize: '80px',
            fontStyle: 'italic',
            fontWeight: 900,
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          ¡VICTORIA PRO!
        </h1>
        <p style={{ fontSize: '30px', color: 'rgba(255,255,255,0.8)', marginTop: '10px', margin: 0 }}>
          {tournamentName}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center', width: '40%' }}>
          <img
            src={winnerPhoto}
            alt={winnerNames}
            style={{ borderRadius: '50%', border: '5px solid #ccff00', width: 250, height: 250, objectFit: 'cover' }}
          />
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '15px', margin: 0 }}>{winnerNames}</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '120px',
              fontWeight: 900,
              color: 'white',
              margin: 0,
              letterSpacing: '-5px',
            }}
          >
            {score}
          </p>
        </div>

        <div style={{ textAlign: 'center', width: '40%', opacity: 0.5 }}>
          <img
            src={loserPhoto}
            alt={loserNames}
            style={{ borderRadius: '50%', border: '5px solid white', width: 250, height: 250, objectFit: 'cover' }}
          />
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '15px', margin: 0 }}>{loserNames}</p>
        </div>
      </div>

      {highlight && (
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px 40px',
            borderRadius: '20px',
          }}
        >
          <p style={{ fontSize: '25px', color: '#ccff00', margin: 0 }}>🔥 DATO DESTACADO 🔥</p>
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '5px', margin: 0 }}>{highlight}</p>
        </div>
      )}

      <p style={{ fontSize: '20px', color: '#666', margin: 0 }}>Generado automáticamente por smartpadel58.com</p>
    </div>
  );
}
