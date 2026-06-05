const Subtitle = ({ text, style }) => {
  return (
    <p className='text-color-white' style={style}>
      {text}
    </p>
  );
};

export default Subtitle;
