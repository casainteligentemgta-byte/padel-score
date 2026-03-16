'use client';

import React from 'react';

const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/250';

export interface VictoryCardProps {
  tournamentName: string;
  category?: string;
  winner1: string;
  winner2: string;
  winner1Avatar?: string | null;
  loser1?: string;
  loser2?: string;
  loser1Avatar?: string | null;
  result: string;
  highlight?: string;
}

export function VictoryCard({
  tournamentName,
  category = '',
  winner1,
  winner2,
  winner1Avatar,
  loser1 = 'Rival',
  loser2 = '',
  loser1Avatar,
  result,
  highlight = '',
}: VictoryCardProps) {
  const subtitle = category ? `${tournamentName} - ${category}` : tournamentName;
  const loserNames = [loser1, loser2].filter(Boolean).join(' / ') || 'Rivales';

  return (
    <div
      id="victory-card-download"
      style={{
        width: '1080px',
        height: '1080px',
        backgroundColor: '#0a0a0a',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '10px solid #ccff00',
      }}
    >
      {/* Encabezado Dinámico */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            color: '#ccff00',
            fontSize: '80px',
            fontStyle: 'italic',
            fontWeight: '900',
            textTransform: 'uppercase',
            margin: '0',
          }}
        >
          ¡VICTORIA PRO!
        </h1>
        <p style={{ fontSize: '30px', color: '#ffffffcc', marginTop: '10px' }}>
          {subtitle}
        </p>
      </div>

      {/* Contenedor de Parejas con Datos Reales */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
        {/* Ganadores */}
        <div style={{ textAlign: 'center', width: '40%' }}>
          <img
            src={winner1Avatar || PLACEHOLDER_AVATAR}
            alt={`${winner1} / ${winner2}`}
            style={{
              borderRadius: '50%',
              border: '5px solid #ccff00',
              width: '250px',
              height: '250px',
              objectFit: 'cover',
            }}
          />
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '15px', textTransform: 'uppercase' }}>
            {winner1} / {winner2}
          </p>
        </div>

        {/* Marcador */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '120px',
              fontWeight: '900',
              color: 'white',
              margin: '0',
              letterSpacing: '-5px',
            }}
          >
            {result}
          </p>
        </div>

        {/* Perdedores (con opacidad) */}
        <div style={{ textAlign: 'center', width: '40%', opacity: '0.5' }}>
          <img
            src={loser1Avatar || PLACEHOLDER_AVATAR}
            alt={loserNames}
            style={{
              borderRadius: '50%',
              border: '5px solid white',
              width: '250px',
              height: '250px',
              objectFit: 'cover',
            }}
          />
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '15px', textTransform: 'uppercase' }}>
            {loserNames}
          </p>
        </div>
      </div>

      {/* Dato destacado dinámico */}
      {highlight && (
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px 40px',
            borderRadius: '20px',
            maxWidth: '80%',
          }}
        >
          <p style={{ fontSize: '25px', color: '#ccff00', margin: '0' }}>🔥 DATO DESTACADO 🔥</p>
          <p style={{ fontSize: '35px', fontWeight: 'bold', marginTop: '5px' }}>{highlight}</p>
        </div>
      )}

      <p style={{ fontSize: '20px', color: '#666' }}>Generado automáticamente por smartpadel58.com</p>
    </div>
  );
}
