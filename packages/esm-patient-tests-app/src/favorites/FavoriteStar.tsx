import React from 'react';
import { Star, StarFilled } from '@carbon/react/icons';
import { useFavorites } from './useFavorites';

interface FavoriteStarProps {
  uuid: string;
}

const FavoriteStar: React.FC<FavoriteStarProps> = ({ uuid }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(uuid);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited) {
      removeFavorite(uuid);
    } else {
      addFavorite(uuid);
    }
  };

  const Icon = favorited ? StarFilled : Star;

  return (
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        marginRight: '10px',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon size={20} style={{ color: favorited ? '#f1c21b' : '#8d8d8d' }} />
    </span>
  );
};

export default FavoriteStar;
