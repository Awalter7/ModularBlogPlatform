import { useEffect } from 'react';
import { logPageView } from '../firebase/analitics/firebaseAnalytics';

const useLogPageView = () => {
    logPageView();
}

export default useLogPageView;