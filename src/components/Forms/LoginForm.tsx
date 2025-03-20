import React, { useState } from 'react';
import './forms.css';

interface LoginFormProps {
  name: string;
  username: string;
  onSubmit: (name: string, username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ name, username, onSubmit }) => {
  const [formName, setFormName] = useState(name  || 'Developer');
  const [formUsername, setFormUsername] = useState(username || 'dev-1');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (formName && formUsername) {
      setIsLoading(true);
      onSubmit(formName, formUsername);
      setIsLoading(false);
    }
  };

  return (
    <div className='section'>
      <div className='container'>
        <div className='columns is-centered'>
          <div className='column is-half'>
            <div className='box'>
              <div className='field'>
                <label className='label'>Name</label>
                <div className='control'>
                  <input className='input' type='text' value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
              </div>
              <div className='field'>
                <label className='label'>Username</label>
                <div className='control'>
                  <input className='input' type='text' value={formUsername} onChange={e => setFormUsername(e.target.value)} />
                </div>
              </div>
              <div className='field'>
                <div className='control'>
                  <button className={`button is-primary ${isLoading ? 'is-loading' : ''}`} onClick={handleSubmit} disabled={isLoading}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
