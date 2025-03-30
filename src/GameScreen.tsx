import React, { useEffect, useState } from 'react';
import { parsePlayerAreaPropsFromGameState, PlayerArea, PlayerAreaProps } from './components/PlayerArea/PlayerArea';
// import { } from 'cribbage-core/src/types';
import { EmittedContinueRequest, parseCard, Phase, AgentDecisionType, Card, EmittedDecisionRequest, EmittedWaitingForPlayer, GameEvent, GameState, PlayerIdAndName } from 'cribbage-core';
// import GameScreen.css
// import './GameScreen.css';
import { Deck, PlayingCard } from './components/PlayingCard/PlayingCard';
import { capitalize, capitalizeAndSpace } from './utils';

interface GameScreenProps {
  username: string;
  gameState: GameState | null;
  winner: string | null;
  // recentGameEvent={recentGameEvent}
  //         handleMakeMove={makeMove}
  //         handleDiscard={discard}
  //         requestedDecisionType={requestedDecisionType}
  //         requestedDecisionData={requestedDecisionData}
  //         waitingOnPlayerInfo={waitingOnPlayerInfo}
  recentGameEvent: GameEvent | null;
  handleMakeMove: (card: Card | null) => void;
  handleDiscard: (card: Card[]) => void;
  requestedDecisionType: AgentDecisionType | null;
  requestedDecisionData: EmittedDecisionRequest | null;
  waitingOnPlayerInfo: EmittedWaitingForPlayer | null;
  connectedPlayers: PlayerIdAndName[];
  numberOfCardsToSelect: number;
  continueGame: () => void;
  settings: Record<string, boolean>;
  currentRoundGameEvents: GameEvent[];
}

const GameScreen: React.FC<GameScreenProps> = ({
  username,
  gameState,
  winner,
  recentGameEvent,
  handleMakeMove,
  handleDiscard,
  requestedDecisionType,
  requestedDecisionData,
  waitingOnPlayerInfo,
  connectedPlayers,
  numberOfCardsToSelect,
  continueGame,
  settings,
  currentRoundGameEvents,
}) => {

  const [yourSelectedCards, setYourSelectedCards] = useState<Card[]>([]);
  // const [numberOfCardsToSelect, setNumberOfCardsToSelect] = useState<number>(0);

  const [yourPlayerInfo, setYourPlayerInfo] = useState<PlayerIdAndName | null>(null);
  const [opponentPlayerInfo, setOpponentPlayerInfo] = useState<PlayerIdAndName | null>(null);
  // console.log("yourSelectedCards:", yourSelectedCards);
  useEffect(() => {
    if (settings["One Click Play Card"]) {
      if (gameState?.currentPhase === Phase.PEGGING && yourSelectedCards.length === 1) {
        handleMakeMove(yourSelectedCards[0])
        setYourSelectedCards([]);
      }
    }
  }, [yourSelectedCards, settings, gameState?.currentPhase, handleMakeMove]);

  useEffect(() => {
    if (connectedPlayers) {
      const yourPlayerInfo = connectedPlayers.find(player => player.id === username);
      const opponentPlayerInfo = connectedPlayers.find(player => player.id !== username);
      if (!yourPlayerInfo || !opponentPlayerInfo) {
        console.error('Your player info or opponent player info not found');
        return;
      }
      setYourPlayerInfo(yourPlayerInfo);
      setOpponentPlayerInfo(opponentPlayerInfo);
    }
  }, [connectedPlayers, username]);

  const [yourPlayerAreaProps, setYourPlayerAreaProps] = useState<PlayerAreaProps | null>(null);
  const [opponentPlayerAreaProps, setOpponentPlayerAreaProps] = useState<PlayerAreaProps | null>(null);

  useEffect(() => {
    if (gameState && opponentPlayerInfo && yourPlayerInfo) {
      const yourPlayerAreaProps = parsePlayerAreaPropsFromGameState(
        gameState,
        yourPlayerInfo.id,
        yourPlayerInfo.id,
        requestedDecisionData,
        currentRoundGameEvents,
      );
      const opponentPlayerAreaProps = parsePlayerAreaPropsFromGameState(
        gameState,
        opponentPlayerInfo?.id,
        username,
        requestedDecisionData,
        currentRoundGameEvents,
      );
      setYourPlayerAreaProps(yourPlayerAreaProps);
      setOpponentPlayerAreaProps(opponentPlayerAreaProps);
      // console.log('Your player area props:', yourPlayerAreaProps);
      // console.log('Opponent player area props:', opponentPlayerAreaProps);
    }
  }, [gameState, opponentPlayerInfo, recentGameEvent, requestedDecisionData, username, yourPlayerInfo, currentRoundGameEvents]);

  const calculatePeggingTotal = () => {
    if (!gameState) {
      return 0;
    }
    if (!gameState.peggingStack) {
      return 0;
    }
    const cardValues = gameState.peggingStack.map(card => parseCard(card).pegValue);
    return cardValues.reduce((total, value) => total + value, 0);
  }

  const gamePhaseElement = (() => {
    if (!gameState) {
      return null;
    }
    return (
      <div className="has-text-left is-size-2 has-text-white px-4 py-1">
        {capitalize(gameState?.currentPhase ?? '')}
      </div>
    );
  });

  // create element that will display what is currently happening
  // use the waitingOnPlayerInfo to display what is happening
  // "Waiting on {player.name} to {AgentDecisionType}"
  const waitingOnPlayerElement = (() => {
    if (!waitingOnPlayerInfo) {
      return null;
    }
    const playerName = connectedPlayers.find(player => player.id === waitingOnPlayerInfo.playerId)?.name;
    if (!playerName) {
      console.error('Player name not found');
      return null;
    }
    const description = (requestedDecisionData as EmittedContinueRequest|null)?.description;
    // console.log('Requested decision data:', requestedDecisionData);
    // console.log('Requested decision type:', requestedDecisionType);
    // console.log('Description:', description);
    const continueButton = (
      <button
        className="button continue-button is-primary mx-4 my-3 is-clickable"
        onClick={continueGame}
      >
        {`${description} (continue)`}
      </button>
    );
    if (playerName === yourPlayerInfo?.name) {
      return (
        // <div className="has-text-left is-size-4 has-text-white px-4 py-1">
        <div className="has-text-left">
          <p className="has-text-left is-size-4 has-text-white px-4 py-1">
            Your turn to {capitalizeAndSpace(waitingOnPlayerInfo.waitingFor)}
          </p>
          <p className="has-text-left is-size-4 has-text-white px-4 py-1">
            {requestedDecisionType === AgentDecisionType.DISCARD
              && `Select ${numberOfCardsToSelect} cards to discard`
            }
            {requestedDecisionType === AgentDecisionType.PLAY_CARD
              && 'Select a card to play'
            }
          </p>
          {description && continueButton}
          {!description &&
            <button
              className="button is-primary mx-4 my-3 is-clickable"
              onClick={handleDoneSelecting}
              disabled={numberOfCardsToSelect > 0 && yourSelectedCards.length !== numberOfCardsToSelect}
            >
              {requestedDecisionType === AgentDecisionType.DISCARD
                && 'Discard Selected Card' + (numberOfCardsToSelect > 1 ? 's' : '')
              }
              {requestedDecisionType === AgentDecisionType.PLAY_CARD
                && 'Play Selected Card'
              }
            </button>
          }
          {
            gameState?.currentPhase === Phase.PEGGING &&
            calculatePeggingTotal() >= 21 &&
            (
              <button
                className="button is-danger mx-4 my-3 is-clickable"
                disabled={yourSelectedCards.length !== 0}
                onClick={() => handleMakeMove(null)}
              >
                Go
              </button>
            )
          }
        </div>
      );
    }
    return (
      <div className="has-text-left is-size-4 has-text-white px-4 py-1">
        Waiting on {playerName} to {capitalize(waitingOnPlayerInfo.waitingFor)}
      </div>
    );
  });

  const handleDoneSelecting = () => {
    if (requestedDecisionType === AgentDecisionType.DISCARD) {
      handleDiscard(yourSelectedCards);
    } else if (requestedDecisionType === AgentDecisionType.PLAY_CARD) {
      handleMakeMove(yourSelectedCards[0]);
    }
    setYourSelectedCards([]);
  }

  // create element that combines the waiting info and the game phase info
  const gameInfoElement = (() => {
    return (
      <div className='box game-info'>
        {gamePhaseElement()}
        {waitingOnPlayerElement()}
      </div>
    );
  });

  // if game state is null, show loading spinner using bulma

  if (winner) {
    const winnerName = connectedPlayers.find(player => player.id === winner)?.name;
    if (!winnerName) {
      console.error('Winner name not found');
    }
    return (
      <div className="GameScreen">
        <div className="has-text-left is-size-2 has-text-white px-4 py-1">Game Over</div>
        <div className="has-text-left is-size-4 has-text-white px-4 py-1">
          {winnerName ? `${winnerName} wins!` : 'Game over!'}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="GameScreen">
        <div className="has-text-left is-size-2 has-text-white px-4 py-1">Waiting on server to start game...</div>
        <progress className="progress is-small is-primary" max="100">?%</progress>
      </div>
    );
  }

  return (
    <div className="GameScreen">
      <div
        className="deck"
        style={{ position: 'absolute', top: '50%', left: '25px', transform: 'translateY(-50%)', width: '200px' }}
      >
        <Deck
          stackSize={10}
          topCard={gameState.turnCard}
        />
      </div>
      {gameInfoElement()}
      {
        yourPlayerAreaProps && opponentPlayerAreaProps && (
          <>
            <PlayerArea
              {...yourPlayerAreaProps}
              selectedCards={yourSelectedCards}
              setSelectedCards={setYourSelectedCards}
            />
            <PlayerArea {...opponentPlayerAreaProps} />
            <p className="has-text-left is-size-4 has-text-white px-4 py-1 pegging-total has-text-centered"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              {gameState.currentPhase === Phase.PEGGING && `Pegging total: ${calculatePeggingTotal()} / 31`
              }
            </p>
          </>
        )
      }
    </div>
  );
};

export default GameScreen;
