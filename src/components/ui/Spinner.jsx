import './Spinner.css';

const Spinner = () => {
  return (
    <div className='spinner-wrapper pos-abs w-100 h-100 zindex-1'>
      <div className='spinner pos-abs abs-center w-50 h-50'></div>
    </div>
  );
}
 
export default Spinner;