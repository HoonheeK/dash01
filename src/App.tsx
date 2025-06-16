import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import './App.css';

import { useState, useCallback } from 'react';

function App() {
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [searchValue, setSearchValue] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleMenuSelect = useCallback((key: string) => {
    setSelectedMenu(key);
    setSearchValue(''); // 메뉴 변경 시 검색 값 초기화
  }, []); // setSelectedMenu와 setSearchValue는 안정적이므로 의존성 배열이 비어있어도 됩니다.

  return (
    <div className="app-container" >
      <Header />
      <div className="main-content-wrapper" >
        <Sidebar
          selectedMenu={selectedMenu}
          onMenuSelect={handleMenuSelect}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          isExpanded={isSidebarExpanded}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        />
        <ContentArea
          selectedMenu={selectedMenu}
          searchValue={searchValue}
        />
      </div>
    </div>
  );
}

export default App;
