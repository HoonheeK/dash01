import MakeWidget01 from './01_makeWidget';
import TEST2 from './TEST2';
import TEST3 from './TEST3';
import HOME from './HOME';

type ContentAreaProps = {
  selectedMenu: string;
  searchValue: string;
};

const ContentArea = ({ selectedMenu, searchValue }: ContentAreaProps) => { 
  return (
    <main style={{ flex: 1, padding: 0, height: '100%', overflowY: 'auto' }}>
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
