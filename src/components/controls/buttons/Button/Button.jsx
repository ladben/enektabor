import './Button.css';

import { motion } from 'framer-motion';

const Button = ({
  onClick,
  className,
  text = 'button',
  iconType = '',
  isPressed,
  animation,
  disabled,
  ...props
}) => {

  const animations = {
    'slide-from-bottom': {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const MotionButton = animation ? motion.button : 'button';
  const anim = animation ? animations[animation] : {};

  return (
    <MotionButton
      {...anim}
      className={`
        transition-all
        button-control
        ${disabled ? '' : 'elevation-button'}
        flex flex-row gap-10 flex-align-center
        w-max-content mb-16
        ${iconType === '' ? 'px-24 py-18' : 'px-16 py-8'}
        bg-acc
        text-h2
        ${isPressed ? 'bg-acc-dark' : ''}
        ${disabled ? 'bg-grey' : ''}
        ${className ? className : ''}
      `}
      onClick={disabled ? ()=>{} : onClick}
      {...props}
    >
      {iconType === 'tick' && <img src="/tick.svg" />}
      {text}
    </MotionButton>
  );
}
 
export default Button;