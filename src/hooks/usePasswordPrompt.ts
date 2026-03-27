import { useState, useCallback } from 'react';

export const usePasswordPrompt = () => {
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (password: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const requestPassword = useCallback((message: string, onConfirm: (password: string) => void, title: string = "Autenticação Necessária") => {
    setPasswordModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  }, []);

  const closePasswordModal = useCallback(() => {
    setPasswordModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    passwordModal,
    requestPassword,
    closePasswordModal
  };
};
