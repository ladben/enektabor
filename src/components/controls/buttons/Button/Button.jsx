import './Button.css';

const Button = ({
  onClick,
  className,
  text = 'button',
  iconType = '',
  isPressed,
}) => {
  return (
    <button onClick={onClick} className={`
      button-control
      elevation-button
      flex flex-row gap-10 flex-align-center
      px-16 py-8 w-max-content
      bg-acc
      text-h2
      ${isPressed ? 'bg-acc-dark' : ''}
      ${className ? className : ''}`}
    >
      {iconType === 'tick' && <img src="/tick.svg" />}
      {text}
    </button>
  );
}
 
export default Button;