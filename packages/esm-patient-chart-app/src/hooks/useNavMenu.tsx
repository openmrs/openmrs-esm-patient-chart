import { attach, detach } from '@openmrs/esm-framework';
import { useEffect } from 'react';

export function useNavMenu() {
  useEffect(() => {
    attach('nav-menu-slot', 'patient-chart-nav-items');
    return () => detach('nav-menu-slot', 'patient-chart-nav-items');
  }, []);
}
