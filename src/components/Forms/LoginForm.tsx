import React, { useEffect, useState } from 'react';
import './forms.css';
import { getNameFromLocalStorage, getUsernameFromLocalStorage, saveLoginInfoToLocalStorage } from 'utils';
import { PlayerIdAndName } from 'cribbage-core';

interface LoginFormProps {
  name: string;
  username: string;
  onSubmit: (name: string, username: string) => void;
  connectedPlayers: PlayerIdAndName[];
}

// from local storage
const rememberedName = getNameFromLocalStorage();
const rememberedUsername = getUsernameFromLocalStorage();

// read in default name and username from env and leave blank if not set
const autofillName = rememberedName || process.env.REACT_APP_DEFAULT_NAME || '';
const autofillUsername = rememberedUsername || process.env.REACT_APP_DEFAULT_USERNAME || '';

const LoginForm: React.FC<LoginFormProps> = ({ name, username, onSubmit, connectedPlayers }) => {
  const [formName, setFormName] = useState(name || autofillName);
  const [formUsername, setFormUsername] = useState(username || autofillUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  const handleSubmit = () => {
    if (formName && formUsername) {
      setIsLoading(true);
      onSubmit(formName, formUsername);
      saveLoginInfoToLocalStorage(formName, formUsername);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connectedPlayers.some(player => player.id === autofillUsername)) {
      setAutoLoggingIn(true);
      setIsLoading(true);
      onSubmit(formName, formUsername);
      setIsLoading(false);
    }
  }, [connectedPlayers, formName, formUsername, onSubmit]);

  if (autoLoggingIn) {
    return (
      <></>
    )
  }

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
