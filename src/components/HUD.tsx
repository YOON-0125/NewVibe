import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const HUD: React.FC = () => {
  const { state } = useGameState();

  if (!state.isPlaying) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const healthPercent = (state.player.health / state.player.maxHealth) * 100;
  const expPercent = (state.player.experience / state.player.experienceToNext) * 100;

  return (
    <div className="hud">
      {/* 상태 정보 영역 (50px) */}
      <div className="status-info">
        <div className="left-info">
          <span className="level">LV: {state.player.level}</span>
          <span className="score">Score: {state.score.toLocaleString()}</span>
        </div>
        <div className="right-info">
          <span className="timer">{formatTime(state.time)}</span>
        </div>
      </div>

      {/* 체력바 영역 (30px) */}
      <div className="health-bar-container">
        <span className="bar-label">HP</span>
        <div className="progress-bar health-bar">
          <div 
            className="progress-fill health-fill"
            style={{ width: `${healthPercent}%` }}
          />
          <span className="progress-text">
            {state.player.health}/{state.player.maxHealth}
          </span>
        </div>
      </div>

      {/* 경험치바 영역 (25px) */}
      <div className="experience-bar-container">
        <span className="bar-label">XP</span>
        <div className="progress-bar experience-bar">
          <div 
            className="progress-fill experience-fill"
            style={{ width: `${expPercent}%` }}
          />
          <span className="progress-text">
            {state.player.experience}/{state.player.experienceToNext}
          </span>
        </div>
      </div>

      {/* 스킬 표시 영역 (40px) */}
      <div className="skills-container">
        {state.weapons.orbital.level > 0 && (
          <div className="skill-icon">
            <div className="icon orbital-icon">🔵</div>
            <span className="skill-level">{state.weapons.orbital.level}</span>
          </div>
        )}
        {state.weapons.projectile.level > 0 && (
          <div className="skill-icon">
            <div className="icon projectile-icon">⚔️</div>
            <span className="skill-level">{state.weapons.projectile.level}</span>
          </div>
        )}
        {state.weapons.shield.level > 0 && (
          <div className="skill-icon">
            <div className="icon shield-icon">🛡️</div>
            <span className="skill-level">{state.weapons.shield.level}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;