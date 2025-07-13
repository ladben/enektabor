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
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        box
        flex flex-row gap-10 p-20
        b-radius-20 h-100
        ${state ? state : ''}
        ${className ? className : ''}`}
    >
      {avatar && <Avatar imgSrc={avatar.imgSrc} imgName={avatar.imgName} />}
      <div className='flex-fill flex flex-align-center flex-justify-center'>
        <p>{artist} - {title}</p>
      </div>
      {badgeText && <div className='pos-abs'>{badgeText}</div>}
    </div>
  );
}
 
export default Box;