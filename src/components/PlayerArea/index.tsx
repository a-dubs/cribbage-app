

// a player area is a container for a player's hand, played cards during pegging, their name and username, and their
// points
// if the player is the active user, it will be at the bottom of the screen, otherwise it will be at the top
// if the player is the active user, they can see their hand at all times,
// otherwise, they can only see their played cards

import React from 'react';
import { CardsInPlay, Hand } from '../PlayingCard';
import { Card, GameState } from 'cribbage-core/src/types';
import './style.css';

export function parsePlayerAreaPropsFromGameState(game: GameState, targetPlayerID: string, loggedInUserID: string): PlayerAreaProps {
  const player = game.players.find(player => player.id === targetPlayerID);
  if (!player) {
    throw new Error('Player not found in game');
  }
  return {
    name: player.name,
    username: player.id,
    points: player.score,
    isOpponent: targetPlayerID !== loggedInUserID,
    hand: player.hand,
    playedCards: player.peggingHand
  };
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
}: PlayerAreaProps) => {
  const playedCardsComponent = (
    <CardsInPlay
      cards={playedCards}
      isHand={false}
    />
  );

  const handComponent = (
    <Hand
      title={isOpponent ? `${name}'s Hand` : 'Your hand'}
      cards={hand}
      selectedCards={selectedCards || []}
      setSelectedCards={setSelectedCards || (() => {})}
    />
  );
  return (
    <div className={`player-area ${isOpponent ? 'opponent' : 'you'}`}>
      {!isOpponent ? (
        <>
          {playedCardsComponent}
          {handComponent}
        </>
      ) : (
        <>
          {handComponent}
          {playedCardsComponent}
        </>
      )}
      <div className='card player-info'>
        <div className='card-header'>
          <p className='card-header-title is-centered player-name'>{name} ({username})</p>
        </div>
        <div className='card-content'>
          <p className='player-points has-text-white'>{points} points</p>
        </div>
      </div>
    </div>
  );
}
