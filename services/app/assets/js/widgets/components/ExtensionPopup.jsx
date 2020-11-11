import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { render } from 'react-dom';
import Toast from './Toast';
import CloseButton from './Toast/CloseButton';

const isExtensionInstalled = info => new Promise(resolve => {
  const img = new Image();
  img.src = `chrome-extension://${info.id}/${info.path}`;
  img.onload = () => {
      resolve(true);
  };
  img.onerror = () => {
    resolve(false);
  };
});

const toastOptions = {
  hideProgressBar: false,
  position: toast.POSITION.TOP_CENTER,
  autoClose: false,
  closeOnClick: false,
  toastClassName: 'bg-primary p-0 shadow-none',
  closeButton: <CloseButton />,
  draggable: false,
};

export default domElement => {
  const lastCheckTime = window.localStorage.getItem('lastCheckTime');
  const nowTime = Date.now();
  const oneMonth = 1000 * 60 * 60 * 24 * 30;
  if (window.chrome && (Number(lastCheckTime) + oneMonth < nowTime)) {
    window.localStorage.setItem('lastCheckTime', nowTime);
    // TODO: move to env config extension id and icon path
    const extensionInfo = { id: 'embfhnfkfobkdohleknckodkmhgmpdli', path: 'assets/128.png' };
    isExtensionInstalled(extensionInfo).then(isInstall => {
      if (isInstall === false) { return; }

      render(<ToastContainer {...toastOptions} />, domElement);

      toast(
        <Toast header="Do you know?">
          <p className="text-dark">
            {'We have a '}
            <a
              href="https://chrome.google.com/webstore/detail/codebattle-web-extension/embfhnfkfobkdohleknckodkmhgmpdli?hl=ru&"
              target="_blank"
              rel="noreferrer"
              className="alert-link"
            >
              chrome extension
            </a>
            , would you like to install it?
          </p>
        </Toast>,
      );
    });
  }
};
