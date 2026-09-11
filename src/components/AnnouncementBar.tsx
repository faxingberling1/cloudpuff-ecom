import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <span className="announcement-badge">Fresh Drop 🍓</span>
        <span>Free Worldwide Cuddle Shipping on orders over $45! Code: <strong>CLOUDLOVE</strong> for mystery stickers!</span>
      </div>
    </div>
  );
};
