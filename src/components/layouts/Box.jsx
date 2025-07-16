import './Box.css';

import Avatar from '../ui/Avatar';

const Box = ({
  className,
  onClick,
  artist,
  title,
  state='default',
  avatar=null,
  badgeText=null,
  smallImg=false,
  autoHeight=false,
}) => {
  console.log('badgeText: ', badgeText);
  return (
    <div
      onClick={onClick}
      className={`
        box
        flex flex-row gap-10 p-20 flex-align-center
        b-radius-20 ${!autoHeight ? 'h-100' : ''} w-100
        pos-rel
        ${state ? state : ''}
        ${className ? className : ''}`}
    >
      {avatar && <Avatar imgSrc={avatar.imgSrc} imgName={avatar.imgName} smallImg={smallImg} state="simple" />}
      <div className='flex-fill flex flex-align-center flex-justify-center'>
        <p>{artist} - {title}</p>
      </div>
      {badgeText && <div className='badge pos-abs text-color-bg bg-acc b-radius-5 zindex-10'>{badgeText}</div>}
    </div>
  );
}
 
export default Box;