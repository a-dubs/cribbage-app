// a player area is a container for a player's hand, played cards during pegging, their name and username, and their
// points
// if the player is the active user, it will be at the bottom of the screen, otherwise it will be at the top
// if the player is the active user, they can see their hand at all times,
// otherwise, they can only see their played cards

import React from 'react';
import { StackedHand } from '../PlayingCard/PlayingCard';
// import {  } from 'cribbage-core/src/types';
// import './PlayerArea.css';
import { ActionType, AgentDecisionType, EmittedDecisionRequest, EmittedMakeMoveRequest, GameEvent, getMostRecentEventForPlayerByActionType, getMostRecentScoreableEventForPlayer, Card, GameState, Phase } from 'cribbage-core';
import { capitalizeAndSpace } from '../../utils';

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

  if (game.currentPhase === Phase.PEGGING) {
    if (!requestedDecisionData || requestedDecisionData.requestType !== AgentDecisionType.PLAY_CARD) {
      currentHand = [];
      playedCards = [];
      console.error('No requested decision data during pegging phase');
    } else {
      const makeMoveData = (requestedDecisionData as EmittedMakeMoveRequest);
      playedCards = makeMoveData.playedCards
        .filter(playedCard => playedCard.playerId === targetPlayerID)
        .map(playedCard => playedCard.card);
      currentHand = player.hand.filter(card => !playedCards.includes(card));
    }
  } else if (game.currentPhase === Phase.COUNTING) {
    showHand = true;
    currentHand = player.hand;
    playedCards = [];
    const dealerId = game.players.find(player => player.isDealer)?.id;
    if (dealerId === targetPlayerID) {
      crib = game.crib;
      showCrib = true;
    }
    // const mostRecentGameEvent = getMostRecentScoreableEventForPlayer(
    //   currentRoundGameEvents || [],
    //   targetPlayerID
    // );
    // if (mostRecentGameEvent && mostRecentGameEvent.actionType === ActionType.SCORE_HAND) {
    //   showCrib = true;
    // } else {
    //   showCrib = false;
    // }
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
  const playedCardsComponent = currentPhase === Phase.PEGGING && (
    <StackedHand
      title={isOpponent ? `${name}'s Played Cards` : 'Your Played Cards'}
      cards={playedCards}
      selectedCards={[]}
      setSelectedCards={() => {}}
      hidden={false}
    />
  );

  const handPointsTextSuffix = handPoints ? ` (${handPoints} points)` : '';
  const handComponent = (
    <StackedHand
      title={(isOpponent ? `${name}'s Hand` : 'Your hand') + handPointsTextSuffix}
      cards={hand}
      selectedCards={selectedCards || []}
      setSelectedCards={setSelectedCards || (() => {})}
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
      setSelectedCards={() => {}}
      hidden={showCrib ? false : true}
    />
  );

  return (
    <div
      className={`w-full relative ${isOpponent ? 'fixed top-2' : 'fixed bottom-2'}`}
    >
      {isOpponent ? (
        <>
          {handComponent}
          {crib ? cribComponent : playedCardsComponent}
        </>
      ) : (
        <>
          {crib ? cribComponent : playedCardsComponent}
          {handComponent}
        </>
      )}
      <div
        className="absolute right-5 w-48 rounded-lg bg-gray-800 text-white"
        style={{ top: isOpponent ? '10px' : undefined, bottom: isOpponent ? undefined : '10px' }}
      >
        <div className="text-center font-bold">
          <p>{isDealer ? '👑 ' : ''}{name} ({username})</p>
        </div>
        <div className="text-center">
          <p>{points} points</p>
        </div>
        {lastScoredPointsInfo && (
          <p className={`absolute w-full text-center text-blue-500 ${isOpponent ? 'bottom-[-0.5em]' : 'top-[-0.5em]'}`}>
            {`+${lastScoredPointsInfo.points} points`}
          </p>
        )}
      </div>
    </div>
  );
};
