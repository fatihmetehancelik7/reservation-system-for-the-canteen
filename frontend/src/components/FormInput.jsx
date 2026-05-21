
const FormInput = ({ label, type = 'text', name, value, onChange, required = false, placeholder = '' }) => {
    return (
        <div className="form-group">
            <label className="form-label">{label} {required && <span className="text-danger">*</span>}</label>
            <input 
                type={type} 
                className="form-control" 
                name={name} 
                value={value} 
                onChange={onChange} 
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
};

export default FormInput;
