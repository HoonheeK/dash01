import React, { useState, useRef } from 'react';
import { getProjects, Project } from '../services/api'; // Project 타입을 가져옵니다.
import { HotTable, HotColumn } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';

// Handsontable에 표시될 데이터의 구조 정의
interface DisplayProject {
  Name: string;
  ProductAxisGroupAttribute: string;
  ProjectManagerName: string;
}

// Handsontable 컬럼 설정
const columnsConfig: { data: keyof DisplayProject; title: string }[] = [
  { data: 'Name', title: 'Project Name' },
  { data: 'ProductAxisGroupAttribute', title: 'Product Axis Group' },
  { data: 'ProjectManagerName', title: 'Project Manager' },
];

// Handsontable 컬럼 너비 설정 (columnsConfig 순서에 맞게)
const columnWidthsConfig: number[] = [
  250, // Project Name 너비
  150, // Product Axis Group 너비
  100, // Project Manager 너비
];

const MakeWidget01: React.FC = () => {
  const [pageTitle, setPageTitle] = useState('01_makeWidget Page');
  const [subTitle, setSubTitle] = useState('Use the menu above to set up your widget.');

  const buttonContainerStyle: React.CSSProperties = {
    marginBottom: '20px',
    display: 'flex',    flexDirection: 'row',
    alignItems: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0', // 밝은 회색 배경
    border: '1px solid #dcdcdc',
    borderRadius: '4px',
    padding: '5px 5px',
    margin: '0 5px', // 버튼 사이 간격
    cursor: 'pointer',
    textAlign: 'left',
    width: 'auto', // 버튼 너비를 내용에 맞게 자동 조절
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#333',
    transition: 'background-color 0.2s ease', // 부드러운 배경색 변경 효과
  };

  const arrowSymbol = '>'; // 유니코드 오른쪽 화살표

  const menuItems = [
    { id: 'setProject', label: 'Set Project' },
    { id: 'setData', label: 'Set Data' },
    { id: 'setChart', label: 'Set Chart' },
    { id: 'saveWidget', label: 'Save Widget' },
  ];

  const [projects, setProjects] = useState<DisplayProject[]>([]); // 상태 타입을 DisplayProject 배열로 변경
  const hotTableComponent = useRef<HotTable | null>(null); // Ref should be for the HotTable React component wrapper


  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'Set Data':
        setPageTitle('Select Data');
        setSubTitle('Please select the data source for your widget.');
        break;
      case 'Set Chart':
        setPageTitle('Select Chart and Set attributes of chart');
        setSubTitle('Choose a chart type and configure its properties.');
        break;
      case 'Save Widget': // "Set Widget" 대신 "Save Widget"으로 가정합니다 (menuItems 기준).
        setPageTitle('Write widget name and save');
        setSubTitle('Enter a name for your widget and click save.');
        break;
      case 'Set Project':
          setPageTitle('Select Project');
          setSubTitle('Loading projects...');
          getProjects()
            .then(data => {
              // API 응답 데이터를 DisplayProject 형태로 변환
              const displayData: DisplayProject[] = data.map((p: Project) => ({
                Name: p.Name,
                ProductAxisGroupAttribute: p.ProductAxisGroupAttribute,
                ProjectManagerName: p.ProjectManager?.Name || 'N/A', // ProjectManager 또는 그 Name이 없을 경우 'N/A'
              }));

              setProjects(displayData);
              setSubTitle('Please select a project from the list below.');
              // Access the core Handsontable instance via hotInstance property of the wrapper
              if (hotTableComponent.current && hotTableComponent.current.hotInstance) {
                hotTableComponent.current.hotInstance.loadData(displayData);
              } else {
                // This case should ideally not happen if the ref is correctly set up
                console.error("Handsontable instance not available.");
              }
            })
            .catch(error => {
              setSubTitle(`Error loading projects: ${error.message}`);
              console.error("Failed to fetch projects:", error);
            });
            break;
      default:
        console.log(`${action} clicked`);
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2>{pageTitle}</h2>
      <p>{subTitle}</p>
      <div style={buttonContainerStyle}>
        {menuItems.map(item => (
          <button key={item.id} onClick={() => handleButtonClick(item.label)} style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}>
            <span style={{ marginRight: '10px', color: '#555' }}>{arrowSymbol}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ width: '100%', marginTop: '20px' }}>
        <HotTable
          data={projects}
          ref={hotTableComponent}
          colHeaders={columnsConfig.map(col => col.title)} // 컬럼 설정을 사용하여 헤더 설정
          colWidths={columnWidthsConfig} // 컬럼 너비 설정 추가
          filters={true} // 필터 기능 활성화
          dropdownMenu={true} // 드롭다운 메뉴 활성화 (필터/정렬 UI에 필요할 수 있음)
          columnSorting={true} // 정렬 기능 활성화
          licenseKey="non-commercial-and-evaluation"
          width="550px"
          height="300px"
          readOnly={true}
        >
          {columnsConfig.map((col) => (
            <HotColumn
              key={col.data}
              data={col.data as string} // data prop은 string을 기대합니다.
              title={col.title} // HotColumn의 title prop은 colHeaders가 설정되어 있으면 중복될 수 있으나, 명시적으로 둘 수 있습니다.
            />
          ))}
        </HotTable>
      </div>
      <div>
        <label>Selected Project : </label>
        <input type="text" value={"AA"} readOnly style={{ marginLeft: '10px' }} />
        <button onClick={() => console.log("Select button clicked")} style={{ marginLeft: '10px' }}>
          Select
        </button>
      </div>
    </div>
  );
};
export default MakeWidget01;