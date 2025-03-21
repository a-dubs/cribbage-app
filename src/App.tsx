import React, { useEffect, useState } from 'react';
import './App.css';
import useWebSocket from './hooks/useWebSocket';
import { PlayerIdAndName } from 'cribbage-core/src/types';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';

function App() {
  // const [name, setName] = useState('Developer');
  // const [username, setUsername] = useState('dev-1');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [yourPlayerInfo, setYourPlayerInfo] = useState<PlayerIdAndName | null>(null);
  const [opponentPlayerInfo, setOpponentPlayerInfo] = useState<PlayerIdAndName | null>(null);
  const {
    gameState,
    recentGameEvent,
    login,
    startGame,
    waitingOnPlayerInfo,
    connectedPlayers,
    winner,
    requestedDecisionType,
    requestedDecisionData,
    makeMove,
    discard,
    numberOfCardsToSelect,
    continueGame,
  } = useWebSocket(username, name);

  useEffect(() => {
    if (connectedPlayers) {
      const yourPlayerInfo = connectedPlayers.find(player => player.id === username);
      const opponentPlayerInfo = connectedPlayers.find(player => player.id !== username);
      if (!yourPlayerInfo || !opponentPlayerInfo) {
        console.log('Your player info or opponent player info not found');
        return;
      }
      setYourPlayerInfo(yourPlayerInfo);
      setOpponentPlayerInfo(opponentPlayerInfo);
    }
  }, [connectedPlayers, username]);

  useEffect(() => {
    if (formSubmitted) {
      login(name, username);
      setFormSubmitted(false);
    }
  }, [formSubmitted, login, name, username]);

  const handleFormSubmit = (formName: string, formUsername: string) => {
    console.log('Form submitted:', formName, formUsername);
    setName(formName);
    setUsername(formUsername);
    setFormSubmitted(true);
  };

  return (
    <div className="App has-background-grey-dark">
      {yourPlayerInfo && opponentPlayerInfo ? (
        <GameScreen
          username={username}
          gameState={gameState}
          winner={winner}
          recentGameEvent={recentGameEvent}
          handleMakeMove={makeMove}
          handleDiscard={discard}
          requestedDecisionType={requestedDecisionType}
          requestedDecisionData={requestedDecisionData}
          waitingOnPlayerInfo={waitingOnPlayerInfo}
          connectedPlayers={connectedPlayers}
          numberOfCardsToSelect={numberOfCardsToSelect || 0}
          continueGame={continueGame}
        />
      ) : (
        <HomeScreen
          name={name}
          username={username}
          onFormSubmit={handleFormSubmit}
          handleStartGame={startGame}
          connectedPlayers={connectedPlayers}
        />
      )}
    </div>
  );
}

export default App;
