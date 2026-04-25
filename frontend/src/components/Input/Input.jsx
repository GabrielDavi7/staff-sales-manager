// frontend/src/components/Input/Input.jsx
import './Input.css';

const Input = ({ label, error, id, className = '', ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input 
        id={inputId} 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;