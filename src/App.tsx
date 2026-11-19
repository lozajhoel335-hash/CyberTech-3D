import { useEffect, useState } from 'react';
import EducationView from './components/EducationView';
import HomeHub from './components/HomeHub';
import LabViewport from './components/LabViewport';
import SidebarNav from './components/SidebarNav';
import WorkshopView from './components/WorkshopView';
import type { AppSection } from './types/hardware';
import { parseInitialViewFromSearch } from './utils/labLogic';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(() =>
    typeof window !== 'undefined'
      ? parseInitialViewFromSearch(window.location.search)
      : 'home',
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.section = activeSection;
  }, [activeSection]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#070B14] text-slate-100">
      <SidebarNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onSetMobileOpen={setMobileMenuOpen}
      />

      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {activeSection === 'home' && (
          <HomeHub onSelectSection={setActiveSection} />
        )}
        {(activeSection === 'desktop' ||
          activeSection === 'motherboard' ||
          activeSection === 'laptop' ||
          activeSection === 'phone') && (
          <LabViewport
            modelType={activeSection}
            onNavigateSection={setActiveSection}
          />
        )}
        {activeSection === 'workshop' && <WorkshopView />}
        {activeSection === 'education' && <EducationView />}
      </main>
    </div>
  );
}
