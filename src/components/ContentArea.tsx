import MakeWidget01 from './01_makeWidget';
import TEST2 from './TEST2';
import TEST3 from './TEST3';
import HOME from './HOME';
import { HEADER_WIDTH_PX } from './Header'; // Header에서 너비 상수 import

type ContentAreaProps = {
  selectedMenu: string;
  searchValue: string;
};

const ContentArea = ({ selectedMenu, searchValue }: ContentAreaProps) => { 
  return (
    // <main style={{ flex: 1, padding: 0, height: '100%', width:`${HEADER_WIDTH_PX-200}px`, overflowY: 'auto' }}>
    <main style={{ flex: 1, padding: 0, height: '100%', overflowY: 'auto', width :'100%'}}>
      {selectedMenu === 'home' && !searchValue.trim() && (
        <HOME />
      )}
      {selectedMenu === 'makeWidget' && !searchValue.trim() && (
        <MakeWidget01 />
      )}
      {selectedMenu === 'showDashboard' && !searchValue.trim() && (
        <TEST2 />
      )}
      {selectedMenu === 'configDashboard' && !searchValue.trim() && (
        <TEST3 />
      )}

    </main>
  );
};
export default ContentArea;
