import React, { useEffect } from 'react';
import LoginForm from './components/Forms/LoginForm';
import { StartGameForm } from './components/Forms/StartGameForm';
import { PlayerIdAndName } from 'cribbage-core';
import { MAX_PLAYERS } from './constants';


interface HomeScreenProps {
  name: string;
  username: string;
  onFormSubmit: (name: string, username: string) => void;
  handleStartGame: () => void;
  connectedPlayers: PlayerIdAndName[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ name, username, onFormSubmit, handleStartGame, connectedPlayers }) => {
  // const yourPlayerInfo = connectedPlayers.find(player => player.id === username);
  // const otherPlayers = connectedPlayers.filter(player => player.id !== username);

  const [showLoginForm, setShowLoginForm] = React.useState(!name || !username);
  const [showStartGameForm, setShowStartGameForm] = React.useState(false);

  useEffect(() => {
    // if you are connected, show the start game form
    if (connectedPlayers.some(player => player.id === username)) {
      setShowStartGameForm(true);
    }
  }, [connectedPlayers, username]);

  useEffect(() => {
    if (name && username) {
      setShowLoginForm(false);
    }
  }, [name, username]);

  // log state of showLoginForm and showStartGameForm
  useEffect(() => {
    console.log('showLoginForm:', showLoginForm);
    console.log('showStartGameForm:', showStartGameForm);
  }, [showLoginForm, showStartGameForm]);


  // show list of players that are currently connected
  // indicate which player is you
  // show a total at the top like (1/2) to indicate how many players are connected
  const connectedPlayersComponent = (
    <div className='columns mt-6'> 
      <div className="connected-players-component card column is-4 is-offset-4">
        <header className="card-header">
          
        </header>
        <div className="card-content">
          <p className="has-text-white is-size-4 has-text-centered mb-4 has-text-weight-bold">
            Connected Players
            {` (${connectedPlayers.length}/${MAX_PLAYERS})`}
          </p>
          <div className="content connected-players-list">
            {connectedPlayers.map(player => (
              <div key={player.id} className="connected-player-list-item is-size-5">
                {player.id === username ? <strong>{player.name} (You)</strong> : player.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="HomeScreen">
      <div>
        <div className=''>
          <h1 className="is-size-1 has-text-white has-text-weight-light mt-4">Cribbage</h1>
        </div>
        <div className='py-2'>
          <h2 className="is-size-4 has-text-white has-text-weight-light">
            {(name && username) ? (
              `Welcome, ${name} (${username})`
            ) : (
              'Please login!'
            )}
          </h2>
        </div>
      </div>
      {
        showLoginForm && (
          <LoginForm
            name={name}
            username={username}
            onSubmit={onFormSubmit}
            connectedPlayers={connectedPlayers}
          />
        )
      }
      {
        showStartGameForm && (
          <StartGameForm
            handleStartGame={handleStartGame}
            openSlots={MAX_PLAYERS - connectedPlayers.length}
          />
        )
      }
      {connectedPlayersComponent}
    </div >
  );
};

export default HomeScreen;
