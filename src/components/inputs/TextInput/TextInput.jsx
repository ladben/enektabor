import './TextInput.css'

const TextInput = ({
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  className = '',
}) => {
  return (
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className={`text-input bg-acc text-h2 text-color-bg flex flex-justify-center flex-align-center w-100 ${className}`}
    />
  );
};
 
export default TextInput;