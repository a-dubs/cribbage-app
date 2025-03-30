import React from 'react';
import { Card } from 'cribbage-core/src/types';
// import './style.css';

const cardNameMap: { [key: string]: string } = {
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  jack: 'jack',
  queen: 'queen',
  king: 'king',
  ace: 'ace'
};

const backOfCardPath = '/assets/cards/png/back.png';
const backOfCardName = 'back_of_card';

function convertCardToImageName(card: Card) {
  const cardName = card.split('_')[0];
  const cardSuit = card.split('_')[1];
  const convertedCardName = cardNameMap[cardName.toLowerCase()] || cardName;
  return `${convertedCardName}_of_${cardSuit.toLowerCase()}`;
}

function convertCardToImagePath(card: Card) {
  const cardName = card.split('_')[0];
  const cardSuit = card.split('_')[1];
  const convertedCardName = cardNameMap[cardName.toLowerCase()] || cardName;
  return `/assets/cards/png/${convertedCardName}_of_${cardSuit.toLowerCase()}.png`;
}

interface PlayingCardProps {
  card: Card | null;
  hidden: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectable?: boolean;
}
export const PlayingCard = ({ card, hidden, onClick, isSelected, isSelectable }: PlayingCardProps) => {
  const cardImagePath = hidden || card === null ? backOfCardPath : convertCardToImagePath(card);
  const cardImageName = hidden || card === null ? backOfCardName : convertCardToImageName(card);
  const id = hidden || card === null ? backOfCardName : card;
  return (
    <div
      className={`inline-block rounded-lg border-2 ${isSelected ? 'border-red-500 mt-2 mb-1' : 'border-black'} ${isSelectable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ padding: '3px 5px 3px 1px', overflow: 'hidden' }}
    >
      <img
        className="w-full h-24 mx-auto pointer-events-none select-none"
        src={cardImagePath}
        alt={cardImageName}
        id={id}
        style={{ marginTop: '2px', marginBottom: '-4px', marginLeft: '2px', marginRight: '2px' }}
      />
    </div>
  );
};

export interface CardsInPlayProps {
  cards: Card[];
  title?: string;
  isHand: boolean;
  hidden?: boolean;
}

export const CardsInPlay = ({ cards, title, isHand, hidden = false }: CardsInPlayProps) => {
  return (
    <div className={`w-1/3 mx-auto py-2 ${isHand ? 'border-t-2 border-b-2 border-white' : 'bg-gray-600 rounded-2xl my-5'}`}>
      {title && <p className="text-lg text-light">{title}</p>}
      <div className="flex flex-wrap justify-center items-center">
        {cards.map((card, index) => (
          <PlayingCard key={index} card={card} hidden={hidden} />
        ))}
      </div>
    </div>
  );
}

export interface HandProps {
  cards: Card[];
  title: string;
  selectedCards: Card[];
  setSelectedCards: (cards: Card[]) => void;
  hidden: boolean;
}

export const Hand = ({
  cards,
  title,
  selectedCards,
  setSelectedCards,
  hidden,
}: HandProps) => {
  const handleCardClick = (card: Card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(selectedCard => selectedCard !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  return (
    <div className="w-1/3 mx-auto py-2 border-t-2 border-b-2 border-white">
      <p className="text-lg text-light">{title}</p>
      <div className="flex flex-wrap justify-center items-center">
        {
          cards.map((card, index) => {
            return (
              <PlayingCard
                key={index}
                card={card}
                hidden={hidden}
                onClick={() => handleCardClick(card)}
                isSelected={selectedCards.includes(card)}
              />
            );
          })
        }
      </div>
    </div>
  );
}


export interface CardStackProps {
  /** Array of elements (cards) to render in the stack */
  items: React.ReactNode[];
  /** Horizontal offset (in percentage) between each card. Default is 25 */
  offset?: number;
  /** Whether to enable the hover animation. Default is true */
  hoverAnimation?: boolean;
}

export const CardStack: React.FC<CardStackProps> = ({
  items,
  offset = 30,
  hoverAnimation = false,
}) => {
  return (
    <div className="relative inline-block w-full h-28 mb-4">
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute top-0 ${hoverAnimation ? 'hover:mt-0' : ''}`}
          style={{
            left: `${index * offset}px`,
            zIndex: index, // lower index is at the bottom of the stack
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export interface DeckProps {
  stackSize: number;
  topCard: Card | null;
  onClick?: () => void;
}

// create a deck using the card stack component
export const Deck: React.FC<DeckProps> = ({ stackSize, topCard, onClick }) => {
  const deckItems = [];
  for (let i = 0; i < stackSize; i++) {
    deckItems.push(
      <PlayingCard
        key={i}
        card={null}
        hidden={true}
      />
    );
  }
  if (topCard) {
    deckItems.push(
      <PlayingCard
        key={stackSize}
        card={topCard}
        hidden={false}
        isSelected={false}
      />
    );
  }

  return (
    <div onClick={onClick}>
      <CardStack items={deckItems} hoverAnimation={false} offset={3} />
    </div>
  );
}


// Stacked Hand component
export interface StackedHandProps {
  cards: Card[];
  title: string;
  selectedCards: Card[];
  setSelectedCards: (cards: Card[]) => void;
  hidden: boolean;
  stackOffset?: number;
  hoverAnimation?: boolean;
  areSelectable?: boolean;
}

export const StackedHand = ({
  cards,
  title,
  selectedCards,
  setSelectedCards,
  hidden,
  stackOffset,
  hoverAnimation = false,
  areSelectable,
}: StackedHandProps) => {
  const handleCardClick = (card: Card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(selectedCard => selectedCard !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const items = cards.map((card, index) => (
    <PlayingCard
      key={index}
      card={card}
      hidden={hidden}
      onClick={() => handleCardClick(card)}
      isSelected={selectedCards.includes(card)}
      isSelectable={areSelectable}
    />
  ));

  return (
    <div className="w-1/3 mx-auto py-2">
      <p className="text-lg text-light">{title}</p>
      <CardStack items={items} offset={stackOffset} hoverAnimation={hoverAnimation} />
    </div>
  );


}

