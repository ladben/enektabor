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
    <div className={`avatar ${className} w-100 b-radius-10`}>
      <img src={imgSrc} alt={imgName} className='w-100' />
    </div>
  );
}
 
export default Avatar;