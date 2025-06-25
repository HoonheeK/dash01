const menuItems = [
  { key: 'home', labelKey: 'Home' },
  { key: 'makeWidget', labelKey: 'Widget 作成' },
  { key: 'makeDashboard', labelKey: 'Dashboard 作成' },
  { key: 'configDashboard', labelKey: '各種設定' },
];

type SidebarProps = {
  selectedMenu: string;
  onMenuSelect: (key: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const Sidebar = ({
  selectedMenu,
  onMenuSelect,
  searchValue,
  onSearchChange,
  isExpanded,
  onMouseEnter,
  onMouseLeave
}: SidebarProps) => {
  const sidebarStyle: React.CSSProperties = {
    background: '#f5f5f5',
    height: '100%',
    // alignSelf: 'flex-start', // 부모 flex 컨테이너의 align-items (기본값 stretch)에 따르도록 제거
    cursor: 'pointer',
    overflow: 'hidden', // 중요: 내용이 넘치는 것을 방지하고 부드러운 너비 전환을 위함
    transition: 'width 0.15s ease-in-out, padding 0.15s ease-in-out',
    width: isExpanded ? 120 : 20, // 확장 시 너비 132px, 축소 시 30px
    minWidth: isExpanded ? 60 : 20, // minWidth도 동적으로 변경
    padding: isExpanded ? '2px' : '0px', // 확장 시 패딩, 축소 시 패딩 없음
    display: 'flex',
    flexDirection: 'row',
    alignItems: isExpanded ? 'stretch' : 'center', // 축소 시 내부 텍스트 중앙 정렬
    justifyContent: isExpanded ? 'flex-start' : 'center', // 축소 시 내부 텍스트 중앙 정렬
    fontSize: '0.8rem', // 기본 폰트 크기
    alignSelf:"stretch", // 부모 flex 컨테이너의 align-items (기본값 stretch)에 따르도록 설정
  };

  const collapsedLabelStyle: React.CSSProperties = {
    writingMode: 'horizontal-tb', // 텍스트 세로 쓰기
    textOrientation: 'mixed', // 텍스트 방향 혼합
    whiteSpace: 'stable',
    fontSize: '0.8rem', // 축소 시 폰트 크기 약간 작게
    userSelect: 'none', // 텍스트 선택 방지
  };

  // 확장되었을 때만 보이는 내용의 스타일
  const contentVisibilityStyle: React.CSSProperties = {
    opacity: isExpanded ? 1 : 0, // 투명도 조절로 부드럽게 나타나고 사라짐
    transition: `opacity 0.2s ease-in-out ${isExpanded ? '0.1s' : '0s'}`, // 확장 시 약간 늦게, 축소 시 바로 투명도 변경
    height: isExpanded ? 'auto' : '0', // 축소 시 높이를 0으로 만들어 공간 차지 않도록 함
    overflow: 'hidden', // 내용이 넘치지 않도록
  };

  return (
    <aside
      style={sidebarStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isExpanded ? (
        <div style={contentVisibilityStyle}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  style={{
                    background: selectedMenu === item.key ? '#e0e0e0' : 'transparent',
                    fontWeight: selectedMenu === item.key ? 'bold' : 'normal',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 4,
                    marginBottom: 8,
                    whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
                  }}
                  onClick={() => onMenuSelect(item.key)}
                >
                  {item.labelKey}
                </li>
              ))}
            </ul>
            <input
              placeholder="search" // placeholder 수정
              style={{ width: '100%', boxSizing: 'border-box', margin: '12px 0', padding: 4, fontSize: '0.8rem' }}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
            />
          </nav>
        </div>
      ) : (
        <div style={collapsedLabelStyle}>
          M<br/>E<br/>N<br/>U
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
