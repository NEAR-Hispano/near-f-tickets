import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { v4 as uuid } from 'uuid';
import Toast from '../components/common/Toast';

type TToastContext = {
  alerts?: { type: string; content: React.ReactChild }[];
  notify?: (content: string, type: string, err?: Error) => void;
};

export const ToastContext = React.createContext<TToastContext>({
  alerts: [],
});

interface ToastContextProvider {
  children: React.ReactChild | React.ReactChild[];
}

function ToastContextProvider({ children }: ToastContextProvider) {
  const [alerts, setAlerts] = React.useState([]);
  const notify = (content = '', type = '', err = null) => {
    // const id = uuid();
    setAlerts((_alerts) => [
      ..._alerts,
      {
        content,
        type,
        // id,
        timeOut: setTimeout(() => {
          setAlerts((__alerts) => __alerts.filter((alert) => alert.id));
        }, 5000),
      },
    ]);
  };
  const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const { id } = e.currentTarget.dataset;
    setAlerts((_alerts) => _alerts.filter((alert) => alert.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed py-4 top-0 right-0 w-1/4 z-50">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.2 },
              }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <Toast
                key={alert.id}
                type={alert.type}
                content={alert.content}
                id={alert.id}
                onClick={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContextProvider;
