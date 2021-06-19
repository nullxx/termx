import { useContext, useMemo } from 'react'

import { BottomMenuContextValue } from './BottomMenuContext';
import DefaultContext from './BottomMenuContext'

const useBottomMenu = (Context: typeof DefaultContext = DefaultContext) : BottomMenuContextValue => {
  const bottomMenuContext = useContext(Context);

  const alert = useMemo(() => {
    return bottomMenuContext;
  }, [bottomMenuContext]);

  return alert as BottomMenuContextValue;
}

export default useBottomMenu;