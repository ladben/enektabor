import './Avatar.css';

const Avatar = ({imgSrc, imgName, state = 'default'}) => {
  let className = 'elevation-sm';

  if (state === 'selected') {
    className = 'selected elevation-sm';
  }

  if (state === 'faded') {
    className = 'faded'
  }

  return (
    <div className={`avatar ${className} w-100 b-radius-10 pos-rel`}>
      {!imgSrc && <p className='pos-abs w-100 h-100 flex flex-align-center flex-justify-center text-color-white text-sm px-4 zindex-1'>{imgName}</p>}
      <img src={imgSrc ? imgSrc : '/no_avatar.png'} alt={imgName} className={`w-100 ${!imgSrc && 'no-image-fade'}`} />
    </div>
  );
}
 
export default Avatar;