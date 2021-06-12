import { useContext, useMemo } from 'react'

import DefaultContext from './BottomMenuContext'

const useBottomMenu = (Context) => {
  const bottomMenuContext = useContext(Context || DefaultContext);
  const alert = useMemo(() => {
    return bottomMenuContext;
  }, [bottomMenuContext]);

  return alert;
}

export default useBottomMenu;