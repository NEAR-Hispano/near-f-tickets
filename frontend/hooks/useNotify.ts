import { useContext, useMemo } from 'react';
import { ToastContext } from '../context/ToastContext';

export default function useNotify() {
  const { notify } = useContext(ToastContext);
  const _notify = useMemo(() => notify, [notify]);
  return _notify;
}
