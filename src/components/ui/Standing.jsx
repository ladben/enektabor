import './Standing.css';

import Avatar from "./Avatar";

const Standing = ({
  avatar,
  name,
  score,
  rankings,
}) => {
  return (
    <div className="flex flex-column flex-align-center w-100 b-radius-10 of-hidden border-sm border-text">
      <div className="flex flex-row flex-justify-center w-100 b-radius-10 of-hidden border-sm border-text">
        <Avatar
          imgSrc={avatar.imgSrc}
          imgName={avatar.imgName}
          state="simple"
          tinyImg
        />
        <div className="flex-fill flex flex-justify-center flex-align-center">
          <p className="text-color-white">{name}</p>
        </div>
        <div className={`score flex flex-align-center flex-justify-center ${rankings ? 'bg-text' : 'bg-acc'}`}>
          <h1 className={rankings ? 'text-color-bg' : 'text-color-white'}>{score}</h1>
        </div>
      </div>
      {rankings && (
        <div className='flex flex-row flex-justify-center flex-align-center w-100 gap-24 px-12 py-8'>
          {rankings.map((count, index) => (
            <div key={index} className='flex flex-column flex-justify-center flex-align-center'>
              <p className='text-sm text-color-white'>{index + 1}. hely</p>
              <p className='text-color-acc'>{count} db</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
export default Standing;