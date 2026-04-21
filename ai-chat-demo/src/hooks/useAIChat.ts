import { useReducer } from 'react';
import { chatReducer, initialState } from '../reducer/chatReducer';
import { useSSEConnection } from './useSSEConnection';

export function useAIChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { status, retryCount, sendMessage, abort, startStreamDemo } = useSSEConnection({ onDispatch: dispatch });

  return {
    messages: state.messages,
    status,
    retryCount,
    sendMessage,
    abort,
    startStreamDemo,
  };
}
