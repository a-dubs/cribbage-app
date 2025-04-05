// a player area is a container for a player's hand, played cards during pegging, their name and username, and their
// points
// if the player is the active user, it will be at the bottom of the screen, otherwise it will be at the top
// if the player is the active user, they can see their hand at all times,
// otherwise, they can only see their played cards

import { StackedHand } from '../PlayingCard/PlayingCard';
import { Card, GameState, Phase } from 'cribbage-core';
import './PlayerArea.css';
import { ActionType, EmittedDecisionRequest, GameEvent, getMostRecentEventForPlayerByActionType, getMostRecentScoreableEventForPlayer } from 'cribbage-core';
import { capitalizeAndSpace } from 'utils';

export function parsePlayerAreaPropsFromGameState(
  game: GameState,
  targetPlayerID: string,
  loggedInUserID: string,
  requestedDecisionData?: EmittedDecisionRequest | null,
  currentRoundGameEvents?: GameEvent[],
): PlayerAreaProps {
  const player = game.players.find(player => player.id === targetPlayerID);
  console.log('Player:', player);
  if (!player) {
    throw new Error('Player not found in game');
  }
  let currentHand: Card[];
  let playedCards: Card[];
  let crib: Card[] | undefined;
  let showCrib = false;
  let showHand = false;

  // Setting hand and played card info
  if (game.currentPhase === Phase.PEGGING) {
      currentHand = player.peggingHand;
      playedCards = player.playedCards;
  } else if (game.currentPhase === Phase.COUNTING) {
    showHand = true;
    currentHand = player.hand;
    playedCards = [];
    const dealerId = game.players.find(player => player.isDealer)?.id;
    if (dealerId === targetPlayerID) {
      crib = game.crib;
      showCrib = true;
    }
  } else {
    currentHand = player.hand;
    playedCards = [];
  }

  const props: PlayerAreaProps = {
    name: player.name,
    username: player.id,
    points: player.score,
    isOpponent: targetPlayerID !== loggedInUserID,
    hand: currentHand,
    playedCards: playedCards,
    crib,
    showCrib,
    showHand,
    isDealer: player.isDealer,
    currentPhase: game.currentPhase,
  };

  // Getting most recent event info for player
  if (currentRoundGameEvents) {
    const mostRecentGameEvent = getMostRecentScoreableEventForPlayer(
      currentRoundGameEvents,
      targetPlayerID
    );
    if (mostRecentGameEvent) {
      props.lastScoredPointsInfo = {
        points: mostRecentGameEvent.scoreChange,
        description: capitalizeAndSpace(mostRecentGameEvent.actionType)
      }
    }
    const handScoredEvent = getMostRecentEventForPlayerByActionType(
      currentRoundGameEvents,
      targetPlayerID,
      ActionType.SCORE_HAND
    );
    if (handScoredEvent) {
      props.handPoints = handScoredEvent.scoreChange;
    }
    const cribScoredEvent = getMostRecentEventForPlayerByActionType(
      currentRoundGameEvents,
      targetPlayerID,
      ActionType.SCORE_CRIB
    );
    if (cribScoredEvent) {
      props.cribPoints = cribScoredEvent.scoreChange;
    }
  }
  return props;
}

export interface ScoredPointsInfo {
  points: number;
  description?: string;
}

export interface PlayerAreaProps {
  name: string;
  username: string;
  points: number;
  isOpponent: boolean;
  hand: Card[];
  playedCards: Card[];
  selectedCards?: Card[];
  setSelectedCards?: (cards: Card[]) => void;
  lastScoredPointsInfo?: ScoredPointsInfo;
  crib?: Card[];
  showCrib?: boolean;
  showHand?: boolean;
  isDealer: boolean;
  handPoints?: number;
  cribPoints?: number;
  currentPhase: Phase;
}

export const PlayerArea = ({
  name,
  username,
  points,
  isOpponent,
  hand,
  playedCards,
  selectedCards,
  setSelectedCards,
  lastScoredPointsInfo,
  crib,
  showCrib,
  showHand,
  isDealer,
  handPoints,
  cribPoints,
  currentPhase,
}: PlayerAreaProps) => {
  console.log('currentPhase:', currentPhase);
  const playedCardsComponent = currentPhase === Phase.PEGGING && (
    <StackedHand
      title={isOpponent ? `${name}'s Played Cards` : 'Your Played Cards'}
      cards={playedCards}
      selectedCards={[]}
      setSelectedCards={() => { }}
      hidden={false}
    />
  );
  const handPointsTextSuffix = handPoints ? ` (${handPoints} points)` : '';
  const handComponent = (
    <StackedHand
      title={(isOpponent ? `${name}'s Hand` : 'Your hand') + handPointsTextSuffix}
      cards={hand}
      selectedCards={selectedCards || []}
      setSelectedCards={setSelectedCards || (() => { })}
      hidden={!showHand && isOpponent}
      hoverAnimation={!isOpponent}
      areSelectable={!isOpponent}
    />
  );

  const cribPointsTextSuffix = cribPoints ? ` (${cribPoints} points)` : '';
  const cribComponent = (
    <StackedHand
      title={(isOpponent ? `${name}'s Crib` : 'Your Crib') + cribPointsTextSuffix}
      cards={crib || []}
      selectedCards={[]}
      setSelectedCards={() => { }}
      hidden={showCrib ? false : true}
    />
  );

  return (
    <div className={`player-area ${isOpponent ? 'opponent' : 'you'}`}>
      {isOpponent ? (
        <>
          {handComponent}
          {crib ? cribComponent : playedCardsComponent}
        </>
      ): (
        <>
          {crib ? cribComponent : playedCardsComponent}
          {handComponent}
        </>
      )}
      <div className='card player-info'>
        <div className='card-header'>
          <p className='card-header-title is-centered player-name'>{isDealer ? '👑 ': ''}{name} ({username})</p>
        </div>
        <div className='card-content'>
          {/* <p className='card-header-icon is-centered'></p> */}
          <p className='player-points has-text-white'>{points} points</p>
        </div>
        {
          lastScoredPointsInfo && (
            <p className='recent-score-message has-text-primary is-centered'>
              {`+${lastScoredPointsInfo.points} points`}
            </p>
          )
        }
      </div>
    </div>
  );
}
