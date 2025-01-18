import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { CardsInPlay, Hand, PlayingCard } from './components/PlayingCard';
import { PlayerArea, PlayerAreaProps } from './components/PlayerArea';
import { GameEvent, GameState } from 'cribbage-core/src/types';
function App() {

  // store the current user's name and username in state
  const [name, setName] = React.useState('Developer');
  const [username, setUsername] = React.useState('dev-1');
  const [phase, setPhase] = React.useState('Pegging');

  // store recentGameEvent in state (GameState type)
  const [recentGameEvent, setRecentGameEvent] = React.useState<GameEvent>();
  // store gameState in state (Game type)
  const [gameState, setGameState] = React.useState<GameState>();

  const yourPlayerAreaProps: PlayerAreaProps = {
    name,
    username,
    points: 12,
    isOpponent: false,
    hand: ["FIVE_CLUBS", "SIX_SPADES", "FIVE_HEARTS"],
    playedCards: ["FOUR_SPADES"],
  };

  const opponentPlayerAreaProps: PlayerAreaProps = {
    name: 'Opponent',
    username: 'opponent-1',
    points: 8,
    isOpponent: true,
    hand: ["ACE_CLUBS", "KING_SPADES"],
    playedCards: ["QUEEN_HEARTS", "JACK_DIAMONDS"]
  };

  const [showForm, setShowForm] = React.useState(false);

  // create person icon for user to change their name
  // when clicked, bring up simple form with two text inputs and a submit button
  // use bulma components for all of this
  // when the form is submitted, update the name in state
  const userSettingsIconElement = (
    <div className='user-settings-icon' onClick={() => setShowForm(true)} style={{ position: 'fixed', bottom: '10px', left: '10px', cursor: 'pointer', zIndex: '1' }}>
      {/* <i className='fas fa-user has-background-light p-5' /> */}
      <p>User Settings</p>
    </div>
  );
  const userSettingsFormElement = (
    <div className={`modal ${showForm ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={() => setShowForm(false)}></div>
      <div className="modal-content">
        <div className='box'>
          <div className='field'>
            <label className='label'>Name</label>
            <div className='control'>
              <input className='input' type='text' value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Username</label>
            <div className='control'>
              <input className='input' type='text' value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>
          <div className='field'>
            <div className='control'>
              <button className='button is-primary' onClick={() => setShowForm(false)}>Submit</button>
            </div>
          </div>
        </div>
      </div>
      <button className="modal-close is-large" aria-label="close" onClick={() => setShowForm(false)}></button>
    </div>
  );

  // when the user clicks the user settings icon, show the user settings form
  // otherwise, show the user settings icon
  const userSettingsElement = (
    <div className='user-settings'>
      {showForm ? userSettingsFormElement : userSettingsIconElement}
    </div>
  );
  



  return (
    <div className="App has-background-grey-dark">
      <div className="has-text-left is-size-2 has-text-white px-4 py-1">{phase}</div>
      {userSettingsElement}
      <PlayerArea {...yourPlayerAreaProps} />
      <PlayerArea {...opponentPlayerAreaProps} />
    </div>
  );
}

export default App;
