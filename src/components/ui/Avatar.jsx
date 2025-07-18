import { useState } from 'react';
import './Avatar.css';
import Spinner from './Spinner';

const Avatar = ({imgSrc, imgName, state = 'default', smallImg, tinyImg }) => {
  const [loaded, setLoaded] = useState(false);

  let className = 'elevation-sm';

  if (state === 'simple') {
    className = '';
  }

  if (state === 'selected') {
    className = 'selected elevation-sm';
  }

  if (state === 'faded') {
    className = 'faded'
  }

  return (
    <div className={`avatar ${className} w-100 h-100 b-radius-10 pos-rel ${smallImg ? 'small' : ''} ${tinyImg ? 'tiny' : ''}`}>
      {!loaded && <Spinner />}
      {(!imgSrc || !loaded) && <p className='pos-abs w-100 h-100 flex flex-align-center flex-justify-center text-color-white text-sm px-4 zindex-1'>{imgName}</p>}
      <img
        src={imgSrc ? imgSrc : '/no_avatar.png'}
        alt={imgName}
        loading='lazy'
        onLoad={() => setLoaded(true)}
        className={`w-100 ${!imgSrc && 'no-image-fade'}`}
        style={{
          opacity: loaded ? 1 : 0.5,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}
 
export default Avatar;