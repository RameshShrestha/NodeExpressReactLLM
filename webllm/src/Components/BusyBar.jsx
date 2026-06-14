import '../index.css'

const BusyBar = ({ label = "Loading..." }) => {
  return (
    <div 
      className="busy-bar-container" 
      role="progressbar" 
      aria-busy="true" 
      aria-label={label}
    >
      <div className="busy-bar-fill"></div>
    </div>
  );
};

export default BusyBar;