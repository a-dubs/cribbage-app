import React, { useState } from 'react';
import './forms.css';

interface StartGameFormProps {
  handleStartGame: () => void;
  openSlots: number;
}

export const StartGameForm = ({ handleStartGame, openSlots }: StartGameFormProps) => {
  const [showModal, setShowModal] = useState(false);

  const handlePlayAgainstBot = () => {
    setShowModal(true);
  };

  const confirmPlayAgainstBot = () => {
    setShowModal(false);
    handleStartGame();
  };

  return (
    <>
      {showModal && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="box">
              <p>Are you sure you want to play against a bot?</p>
              <button className="button is-success px-5 py-3 m-2 mt-4" onClick={confirmPlayAgainstBot}>Yes</button>
              <button className="button px-5 py-3 m-2 mt-4" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={() => setShowModal(false)}></button>
        </div>
      )}

      <div className="start-game-button-container">
        {openSlots > 0 ? (
          <>
            <button className="button is-primary" onClick={handlePlayAgainstBot}>Play Against Bot</button>
          </>
        ) : (
          <button className="button is-primary" onClick={handleStartGame}>Start Game</button>
        )}
      </div>
    </>
  );
};