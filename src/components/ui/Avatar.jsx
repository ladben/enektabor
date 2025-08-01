import { useState } from 'react';
import './Avatar.css';
import Spinner from './Spinner';

const Avatar = ({imgSrc, imgName, state = 'default', smallImg, tinyImg, display = true }) => {
  const [loaded, setLoaded] = useState(false);

  let extraClassName = 'elevation-sm';

  if (state === 'simple') {
    extraClassName = '';
  }

  if (state === 'selected') {
    extraClassName = 'selected elevation-sm';
  }

  if (state === 'faded') {
    extraClassName = 'faded'
  }

  return (
    <div
      className={`
        avatar
        w-100 h-100
        pos-rel
        b-radius-10
        ${!display ? 'flipped' : ''}
        ${smallImg ? 'small' : ''}
        ${tinyImg ? 'tiny' : ''}`}>
      <div className='flip-card-inner'>
        {!loaded && <Spinner />}
        <div className={`flip-card-front b-radius-10 ${extraClassName}`}>
          {(!imgSrc || !loaded) && <p className='pos-abs w-100 h-100 flex flex-align-center flex-justify-center text-color-white text-sm px-4 zindex-1'>{imgName}</p>}
          <img
            src={imgSrc ? imgSrc : '/no_avatar.png'}
            alt={imgName}
            loading='lazy'
            onLoad={() => setLoaded(true)}
            className={`w-100 b-radius-10 ${!imgSrc && 'no-image-fade'}`}
            style={{
              opacity: loaded ? 1 : 0.5,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
        <div className={`flip-card-back b-radius-10 ${extraClassName}`}>
          <p className='pos-abs w-100 h-100 flex flex-align-center flex-justify-center text-color-white text-sm px-4 zindex-1'>{imgName}</p>
          <img
            src='/no_avatar.png'
            alt={imgName}
            loading='lazy'
            onLoad={() => setLoaded(true)}
            className='w-100 no-image-fade b-radius-10'
            style={{
              opacity: loaded ? 1 : 0.5,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
 
export default Avatar;