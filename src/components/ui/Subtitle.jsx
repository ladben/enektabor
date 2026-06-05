const Subtitle = ({ text, style }) => {
  return (
    <p
      className='text-color-white'
      style={{ wordBreak: 'break-word', ...style }}
    >
      {text}
    </p>
  );
};

export default Subtitle;
