import MakeWidget from './01_makeWidget';
import MakeDashboard from './02_makeDashboard';
import TEST3 from './TEST3';
import HOME from './HOME';

type ContentAreaProps = {
  selectedMenu: string;
  searchValue: string;
};

const ContentArea = ({ selectedMenu, searchValue }: ContentAreaProps) => { 
  return (
    <main style={{ flex: 1, padding: 0, height: '100%', overflowY: 'auto', width :'100%'}}>
      {selectedMenu === 'home' && !searchValue.trim() && (
        <HOME />
      )}
      {selectedMenu === 'makeWidget' && !searchValue.trim() && (
        <MakeWidget />
      )}
      {selectedMenu === 'makeDashboard' && !searchValue.trim() && (
        <MakeDashboard />
      )}
      {selectedMenu === 'configDashboard' && !searchValue.trim() && (
        <TEST3 />
      )}

    </main>
  );
};
export default ContentArea;
