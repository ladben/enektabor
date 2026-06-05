const Title = ({ text }) => {
  return (
    <h1 className='text-color-text' style={{ wordBreak: 'break-word' }}>
      {text}
    </h1>
  );
};

export default Title;
