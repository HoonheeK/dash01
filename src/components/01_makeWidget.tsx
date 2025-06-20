import React, { useState, useRef } from 'react';
import { getProjects, Project, getTasksForProject, Task } from '../services/api'; // Task 관련 import 추가
// import Handsontable from 'handsontable'; // 이 예제에서는 직접적인 Handsontable.Core 타입 사용 안 함
import Handsontable from 'handsontable'; // Handsontable 코어 임포트
import { DateCellType } from 'handsontable/cellTypes';
import { HotTable, HotTableClass } from '@handsontable/react'; // HotTableClass 추가
import { ResponsiveBar } from '@nivo/bar'; // Nivo Bar Chart
import { ResponsiveLine } from '@nivo/line'; // Nivo Line Chart
import 'handsontable/dist/handsontable.full.css';

// DateCellType 등록
Handsontable.cellTypes.registerCellType('date', DateCellType);

// Handsontable에 표시될 데이터의 구조 정의
interface DisplayProject {
  ProductAxisGroupAttribute: string;
  Name: string;
  ID: string; // Project의 ID를 표시하기 위해 추가
}

// Handsontable 컬럼 설정 (너비 포함)
const columnsConfig: { data: keyof DisplayProject; title: string; width: string }[] = [ // width 타입을 string으로 변경
  { data: 'ProductAxisGroupAttribute', title: 'Product Axis Group', width: '100%' }, // 150px / 500px = 30%
  { data: 'Name', title: 'Project Name', width: '100%' }, // 250px / 500px = 50%
  { data: 'ID', title: 'ID', width: '100%' }, // 100px / 500px = 20%
];

// Task 테이블 컬럼 설정
const taskColumnsConfig: { data: string; title: string; width?: string, type?: string, dateFormat?: string, className?: string }[] = [ // width 타입을 string으로 변경
  { data: 'Name', title: 'Task Name', width: '100%' }, // 220px / 460px ≈ 47.8% -> 48%
  { data: 'StartDate', title: 'Start', width: '100%', type: 'date', dateFormat: 'YYYY-MM-DD' }, // 60px / 460px ≈ 13.04% -> 13%
  { data: 'EndDate', title: 'End', width: '100%', type: 'date', dateFormat: 'YYYY-MM-DD' }, // 60px / 460px ≈ 13.04% -> 13%
  { data: 'Progress.Status', title: 'Status', width: '100%', className: 'htCenter' }, // 60px / 460px ≈ 13.04% -> 13%
  { data: 'Progress.ProgressRate', title: 'Progr.', width: '100%', type: 'numeric', className: 'htCenter' }, // 60px / 460px ≈ 13.04% -> 13%
];

const MakeWidget01: React.FC = () => {
  const [pageTitle, setPageTitle] = useState('01_makeWidget Page');
  const [subTitle, setSubTitle] = useState('Use the menu above to set up your widget.');

  // Ref for the project Handsontable instance
  const projectHotTableRef = useRef<HotTableClass>(null);

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
  const [selectedProjectName, setSelectedProjectName] = useState<string>(''); // 선택된 프로젝트 이름을 저장할 상태
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); // 선택된 프로젝트 ID를 저장할 상태
  const [isProjectConfirmed, setIsProjectConfirmed] = useState<boolean>(false); // "Select" 버튼 클릭 상태
  const [tasks, setTasks] = useState<Task[]>([]); // 가져온 Task 데이터를 저장할 상태 
  const [taskHeaderSelection, setTaskHeaderSelection] = useState(new Set<string>()); // New state for checkbox table
  const [confirmedTaskColumnKeys, setConfirmedTaskColumnKeys] = useState(new Set<string>()); // "Select" 버튼으로 확정된 Task 테이블 컬럼 키
  const [lastFetchedProjectIdForTasks, setLastFetchedProjectIdForTasks] = useState<string | null>(null); // 마지막으로 Task를 가져온 프로젝트 ID

  // Chart size states - barChartWidth is now string to support "94%" or "500px"
  const [barChartWidth, setBarChartWidth] = useState<string>("94%"); 
  const [barChartHeight, setBarChartHeight] = useState<number>(400);
  // Chart configuration states
  const [barChartIndexBy, setBarChartIndexBy] = useState<string>('');
  const [barChartKeys, setBarChartKeys] = useState<string[]>([]);
  const [barChartLayout, setBarChartLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [barChartGroupMode, setBarChartGroupMode] = useState<'stacked' | 'grouped'>('stacked');
  const [barChartReverse, setBarChartReverse] = useState<boolean>(false);
  const [barChartPadding, setBarChartPadding] = useState<number>(0.3);
  // Bar Chart Axis and Grid states
  const [barChartShowAxisTop, setBarChartShowAxisTop] = useState<boolean>(false); // 기본적으로 Top 축은 숨김
  const [barChartShowAxisRight, setBarChartShowAxisRight] = useState<boolean>(false); // 기본적으로 Right 축은 숨김
  const [barChartShowAxisBottom, setBarChartShowAxisBottom] = useState<boolean>(true);
  const [barChartShowAxisLeft, setBarChartShowAxisLeft] = useState<boolean>(true);
  const [barChartEnableGridX, setBarChartEnableGridX] = useState<boolean>(false); // 기본적으로 X 그리드는 숨김
  const [barChartEnableGridY, setBarChartEnableGridY] = useState<boolean>(true);
  // Bar Chart Label states
  const [barChartEnableLabel, setBarChartEnableLabel] = useState<boolean>(true);
  const [barChartLabelSkipWidth, setBarChartLabelSkipWidth] = useState<number>(12);
  const [barChartLabelSkipHeight, setBarChartLabelSkipHeight] = useState<number>(12);

  const [lineChartXKey, setLineChartXKey] = useState<string>('');
  const [lineChartYKeys, setLineChartYKeys] = useState<string[]>([]);


  type WizardStep = 'project' | 'data' | 'chart' | 'save';
  const [currentStep, setCurrentStep] = useState<WizardStep>('project');

  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'Set Data':
        setPageTitle('Select Data');
        setCurrentStep('data');
        if (selectedProjectId) { // Check if a project ID is actually selected
          if (isProjectConfirmed) { // Check if the selected project is confirmed
            if (selectedProjectId === lastFetchedProjectIdForTasks && tasks.length > 0) {
              setSubTitle(`Displaying existing tasks for project ${selectedProjectName}. Column selections preserved.`);
              console.log('Using existing tasks for project ID:', selectedProjectId, 'Column selections preserved.');
              // taskHeaderSelection is intentionally not reset here to preserve previous selections for this project
            } else {
              setTaskHeaderSelection(new Set()); // Reset checkbox selections for new project tasks
              setConfirmedTaskColumnKeys(new Set());
              setSubTitle(`Fetching tasks for project ID: ${selectedProjectId}...`);
              // At this point, selectedProjectId is guaranteed to be a string.
              getTasksForProject(selectedProjectId) 
                .then(fetchedTasks => {
                  setTasks(fetchedTasks);
                  setLastFetchedProjectIdForTasks(selectedProjectId);
                  setSubTitle(`Tasks loaded for project ${selectedProjectName}. Found ${fetchedTasks.length} tasks.`);
                  console.log('Fetched Tasks:', fetchedTasks);
                })
                .catch(error => {
                  setSubTitle(`Error fetching tasks: ${error.message}`);
                  console.error('Failed to fetch tasks:', error);
                  if (selectedProjectId === lastFetchedProjectIdForTasks) {
                    setLastFetchedProjectIdForTasks(null);
                  }
                  setTasks([]);                  
                  setConfirmedTaskColumnKeys(new Set());
                });
            }
          } else { // Project ID is selected, but not confirmed via "Select" button
            setSubTitle('Please select a project and click "Select" first.');
          }
        } else { // No project ID is selected (selectedProjectId is null)
          setSubTitle('No project selected. Please go to "Set Project" first.');
        }
        break;
      case 'Set Chart':
        setPageTitle('Select Chart and Set attributes of chart');
        setCurrentStep('chart');
        setSubTitle(`Using confirmed columns for chart: ${Array.from(confirmedTaskColumnKeys).join(', ') || 'None'}. Please select columns and click "Select" in the Task table if not done.`);
        console.log('Using confirmed task table columns for chart:', Array.from(confirmedTaskColumnKeys));
        break;
      case 'Save Widget': // "Set Widget" 대신 "Save Widget"으로 가정합니다 (menuItems 기준).
        setPageTitle('Write widget name and save');
        setCurrentStep('save');
        setSubTitle('Enter a name for your widget and click save.');
        break;
      case 'Set Project':
          setPageTitle('Select Project');
          setCurrentStep('project');
          setTaskHeaderSelection(new Set()); // Reset checkbox selections when project changes
          setConfirmedTaskColumnKeys(new Set()); // Reset confirmed columns when project changes
          setLastFetchedProjectIdForTasks(null); 
          setTasks([]); // Task 데이터 초기화하여 Task 테이블 숨기기
          setSubTitle('Loading projects...');
          getProjects()
            .then(data => {
              // API 응답 데이터를 DisplayProject 형태로 변환
              const displayData: DisplayProject[] = data.map((p: Project) => ({
                ProductAxisGroupAttribute: p.ProductAxisGroupAttribute,
                Name: p.Name,
                ID: p.Id || 'N/A', // Project 인터페이스에 Id 속성이 있다고 가정합니다. 실제 속성명에 따라 p.ID 등으로 변경 필요.
              }));

              setProjects(displayData);
              setSubTitle('Please select a project from the list below.');
              // setProjects가 호출되면 HotTable의 data prop이 업데이트되어 테이블이 다시 렌더링됩니다.
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

  // HotTable에서 행 선택 시 호출될 콜백 함수
  // hotInstance를 사용하지 않기 위해 filters와 columnSorting을 false로 설정했다고 가정합니다.
  // 이 경우, startRow (visual row index)는 projects 배열의 인덱스와 동일합니다.
  const handleAfterSelectionEnd = (
    r1: number,           // Visual start row index
    _c1: number,          // Visual start col index (unused) - Renamed from c1 for clarity
    r2: number,           // Visual end row index
    _c2: number,          // Visual end col index (unused) - Renamed from c2 for clarity
    _selectionLayerLevel: number // Selection layer level (unused) - Renamed from selectionLayerLevel
    // hotInstance is no longer passed as a direct parameter by this prop's type
  ) => {
    // 단일 행 선택만 처리
    const hotInstance = projectHotTableRef.current?.hotInstance;
    if (!hotInstance) {
      console.error('Project Handsontable instance not found via ref.');
      return;
    }

    let newSelectedName = '';
    let newSelectedId: string | null = null;

    if (r1 === r2 && r1 >= 0) { // Check for single row selection and valid visual row index
      const visualRow = r1;
      // Convert visual row index to physical row index (index in the original data source)
      const physicalRow = hotInstance.toPhysicalRow(visualRow);

      if (physicalRow !== null && physicalRow >= 0) {
        // Fetch the source data object for the selected visual row
        const selectedRowData = hotInstance.getSourceDataAtRow(physicalRow) as DisplayProject;
        
        if (selectedRowData) {
          newSelectedName = selectedRowData.Name;
          newSelectedId = selectedRowData.ID;
        }
      }
    }

    // 선택된 이름이 이전과 다르면, 확정 상태를 리셋
    if (selectedProjectId !== newSelectedId) {
      setIsProjectConfirmed(false);
      setLastFetchedProjectIdForTasks(null); // Reset if project ID changes
    }
    setSelectedProjectName(newSelectedName);
    setSelectedProjectId(newSelectedId);
  };
  const handleSelectButtonClick = () => {
    // 프로젝트 이름과 ID가 모두 존재할 때만 확정합니다.
    if (selectedProjectName && selectedProjectId) { 
      setIsProjectConfirmed(true);
      setLastFetchedProjectIdForTasks(selectedProjectId); 
    } else {
      console.log("No project selected to confirm.");
    }
  };

  // Task Header Selection Table Data Preparation
  const taskHeaderTableData = taskColumnsConfig.map(col => ({
    select: taskHeaderSelection.has(col.data),
    headerName: col.title,
    key: col.data, // Store the key for identification
  }));

  const taskHeaderTableColumns: Handsontable.ColumnSettings[] = [
    { data: 'select', type: 'checkbox', title: 'Select', width: 60, className: 'htCenter' },
    { data: 'headerName', title: 'Header Name', readOnly: true, width: 220 },
    // 'key' column is not displayed but used internally
  ];


  const handleTaskHeaderCheckboxChange = (key: string, checked: boolean) => {
    setTaskHeaderSelection(prev => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(key);
      } else {
        newSelection.delete(key);
      }
      return newSelection;
    });
  };

  // afterChange handler for the task header selection table
  const handleTaskHeaderTableAfterChange = (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
    if (source === 'loadData' || !changes) {
      return;
    }
    changes.forEach(change => {
      const [row, prop, , newValue] = change;
      // Ensure 'prop' is the 'select' column and 'row' is a valid index
      if (prop === 'select' && typeof row === 'number' && row < taskHeaderTableData.length) {
        const changedItemKey = taskHeaderTableData[row].key;
        if (changedItemKey) {
          handleTaskHeaderCheckboxChange(changedItemKey, newValue as boolean);
        }
      }
    });
  };

  const handleConfirmTaskColumnSelection = () => {
    if (taskHeaderSelection.size > 0) {
      setConfirmedTaskColumnKeys(new Set(taskHeaderSelection));
      setSubTitle(`Columns [${Array.from(taskHeaderSelection).join(', ')}] confirmed for chart. You can now proceed to "Set Chart".`);
      console.log('Confirmed task columns for chart:', Array.from(taskHeaderSelection));
    } else {
      setConfirmedTaskColumnKeys(new Set()); // Ensure it's reset if nothing is selected
      setSubTitle('No columns selected to confirm.');
    }
  };

  // Helper function to get value from task, handling nested keys
  const getTaskValue = (task: Task, key: string): any => {
    if (!key) return undefined;
    if (key.includes('.')) {
      const parts = key.split('.');
      let value: any = task;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return undefined;
        }
      }
      return value;
    }
    return (task as any)[key];
  };
  return (
    <div style={{ padding: '0px'}}>
      <h2>{pageTitle}</h2>
      <p>{subTitle}</p>
      <div style={buttonContainerStyle}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleButtonClick(item.label)}
            style={{
              ...buttonStyle,
              cursor: item.label === 'Set Project' && taskHeaderSelection.size > 0 ? 'not-allowed' : 'pointer',
              opacity: item.label === 'Set Project' && taskHeaderSelection.size > 0 ? 0.5 : 1,
            }}
            disabled={item.label === 'Set Project' && taskHeaderSelection.size > 0}
            onMouseEnter={(e) => {
              if (!(item.label === 'Set Project' && taskHeaderSelection.size > 0)) {
                (e.target as HTMLElement).style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (!(item.label === 'Set Project' && taskHeaderSelection.size > 0)) {
                (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
              }
            }}
          >
            <span style={{ marginRight: '10px', color: '#555' }}>{arrowSymbol}</span>
            {item.label}
          </button>
        ))}
      </div>
      {currentStep === 'project' && (
        <>
          <div style={{ marginTop: '20px' }}>
            <HotTable
              ref={projectHotTableRef} // Assign the ref here
              data={projects}
              columns={columnsConfig} // columns prop 사용
              colHeaders={true} // columnsConfig의 title을 헤더로 사용
              afterSelectionEnd={handleAfterSelectionEnd} // 선택 이벤트 핸들러 추가
              licenseKey="non-commercial-and-evaluation"
              width="94%" // 부모 컨테이너에 맞춰 100% 너비 사용
              height="400px"
              manualColumnResize={true}
              readOnly={true}
              filters={true}
              dropdownMenu={true}
              columnSorting={true} // Allow column sorting for the project table
            >
              {/* HotColumn 자식 요소들은 columns prop을 사용하므로 제거 */}
            </HotTable>
          </div>
          <div>
            <label>Selected Project : </label>
            <input
              type="text"
              value={selectedProjectName}
              readOnly
              style={{
                marginLeft: '10px',
                backgroundColor: isProjectConfirmed ? 'yellow' : undefined,
                fontWeight: isProjectConfirmed ? 'bold' : undefined,
              }}
            />
            <button onClick={handleSelectButtonClick} style={{ marginLeft: '10px' }}>
              Select
            </button>
          </div>
        </>
      )}

      {/* Task Header Selection Table and Task Table */}
      {currentStep === 'data' && isProjectConfirmed && tasks.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Tasks for: {selectedProjectName}</h3>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ marginRight: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Select Task Columns for Chart</h4>
              <HotTable
                data={taskHeaderTableData}
                columns={taskHeaderTableColumns}
                rowHeaders={false}
                colHeaders={true} // Show headers for the selection table itself
                licenseKey="non-commercial-and-evaluation"
                width="300px" // Fixed width for this table
                height="auto" // Adjust height based on content, or set a fixed one
                stretchH="none" // Do not stretch columns for this small table
                afterChange={handleTaskHeaderTableAfterChange}
                className="task-header-selection-table" // Optional: for specific styling
              />
            </div>

            <button
              onClick={handleConfirmTaskColumnSelection}
              disabled={taskHeaderSelection.size === 0}
              style={{
                ...buttonStyle, // 기존 버튼 스타일 재활용
                padding: '8px 15px',
                alignSelf: 'flex-start', // Align button to the top of the flex container
                marginTop: '30px', // Add some top margin to align with the table title
                backgroundColor: taskHeaderSelection.size > 0 ? '#4CAF50' : '#f0f0f0',
                color: taskHeaderSelection.size > 0 ? 'white' : '#aaa',
                cursor: taskHeaderSelection.size > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Select Columns
            </button>
          </div>

          <HotTable
            data={tasks}
            columns={taskColumnsConfig}
            colHeaders={true}
            rowHeaders={true}
            licenseKey="non-commercial-and-evaluation"
            width="94%" // 부모 컨테이너에 맞춰 100% 너비 사용
            height="400px" // 필요에 따라 조절
            manualColumnResize={true}
            readOnly={true}
            filters={true} // Task 테이블에는 필터 활성화
            dropdownMenu={true}
            columnSorting={false} // Task 테이블에는 정렬 활성화
          />
        </div>
      )}

      {/* Nivo Chart 선택 및 표시 영역 */}
      {currentStep === 'chart' && (
        <div style={{ marginTop: '30px'}}>
          <h3>Chart Configuration</h3>
          <p>Select a Nivo chart type and configure its settings using the confirmed columns: <strong>{Array.from(confirmedTaskColumnKeys).join(', ') || 'None'}</strong></p>
          <p>Task data row count: {tasks.length}</p>
          {confirmedTaskColumnKeys.size > 0 && tasks.length > 0 && (
            <>
              {/* --- Bar Chart Configuration & Display --- */}
              <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
                <h4>Bar Chart (<code>@nivo/bar</code>)</h4>
                <div>
                  <label htmlFor="barIndexBy">Index By (X-axis): </label>
                  <select id="barIndexBy" value={barChartIndexBy} onChange={(e) => setBarChartIndexBy(e.target.value)}>
                    <option value="">-- Select X-axis --</option>
                    {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="barKeys">Keys (Y-axis values): </label>
                  {/* For simplicity, allowing one Y key for now. Can be extended to multi-select */}
                  <select id="barKeys" value={barChartKeys[0] || ''} onChange={(e) => setBarChartKeys(e.target.value ? [e.target.value] : [])}>
                    <option value="">-- Select Y-axis --</option>
                    {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label htmlFor="barChartWidth">Width (e.g., 94%, 500px): </label>
                  <input type="text" id="barChartWidth" value={barChartWidth} onChange={(e) => setBarChartWidth(e.target.value)} style={{width: '100px'}}/>

                  <label htmlFor="barChartHeight" style={{ marginLeft: '15px' }}>Height (px): </label>
                  <input type="number" id="barChartHeight" value={barChartHeight} onChange={(e) => setBarChartHeight(parseInt(e.target.value, 10))} min="100" style={{width: '80px'}}/>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label htmlFor="barLayout">Layout: </label>
                  <select id="barLayout" value={barChartLayout} onChange={(e) => setBarChartLayout(e.target.value as 'vertical' | 'horizontal')}>
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>

                  <label htmlFor="barGroupMode" style={{ marginLeft: '15px' }}>Group Mode: </label>
                  <select id="barGroupMode" value={barChartGroupMode} onChange={(e) => setBarChartGroupMode(e.target.value as 'stacked' | 'grouped')}>
                    <option value="stacked">Stacked</option>
                    <option value="grouped">Grouped</option>
                  </select>

                  <label htmlFor="barReverse" style={{ marginLeft: '15px' }}>Reverse: </label>
                  <input
                    type="checkbox"
                    id="barReverse"
                    checked={barChartReverse}
                    onChange={(e) => setBarChartReverse(e.target.checked)}
                  />

                  <label htmlFor="barPadding" style={{ marginLeft: '15px' }}>Padding: </label>
                  <input type="number" id="barPadding" value={barChartPadding} onChange={(e) => setBarChartPadding(parseFloat(e.target.value))} min="0" max="1" step="0.05" style={{width: '50px'}}/>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Axes:</span>
                  <label htmlFor="barAxisTop" style={{ marginRight: '5px' }}>Top: </label>
                  <input type="checkbox" id="barAxisTop" checked={barChartShowAxisTop} onChange={(e) => setBarChartShowAxisTop(e.target.checked)} />
                  
                  <label htmlFor="barAxisRight" style={{ marginLeft: '10px', marginRight: '5px' }}>Right: </label>
                  <input type="checkbox" id="barAxisRight" checked={barChartShowAxisRight} onChange={(e) => setBarChartShowAxisRight(e.target.checked)} />
                  
                  <label htmlFor="barAxisBottom" style={{ marginLeft: '10px', marginRight: '5px' }}>Bottom: </label>
                  <input type="checkbox" id="barAxisBottom" checked={barChartShowAxisBottom} onChange={(e) => setBarChartShowAxisBottom(e.target.checked)} />
                  
                  <label htmlFor="barAxisLeft" style={{ marginLeft: '10px', marginRight: '5px' }}>Left: </label>
                  <input type="checkbox" id="barAxisLeft" checked={barChartShowAxisLeft} onChange={(e) => setBarChartShowAxisLeft(e.target.checked)} />
                </div>
                <div style={{ marginTop: '5px' }}>
                  <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Grids:</span>
                  <label htmlFor="barEnableGridX" style={{ marginRight: '5px' }}>Enable X Grid: </label>
                  <input
                    type="checkbox"
                    id="barEnableGridX"
                    checked={barChartEnableGridX}
                    onChange={(e) => setBarChartEnableGridX(e.target.checked)}
                  />
                  <label htmlFor="barEnableGridY" style={{ marginLeft: '10px', marginRight: '5px' }}>Enable Y Grid: </label>
                  <input
                    type="checkbox"
                    id="barEnableGridY"
                    checked={barChartEnableGridY}
                    onChange={(e) => setBarChartEnableGridY(e.target.checked)}
                  />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Labels:</span>
                  <label htmlFor="barEnableLabel" style={{ marginRight: '5px' }}>Enable Labels: </label>
                  <input
                    type="checkbox"
                    id="barEnableLabel"
                    checked={barChartEnableLabel}
                    onChange={(e) => setBarChartEnableLabel(e.target.checked)}
                  />
                  <label htmlFor="barLabelSkipWidth" style={{ marginLeft: '10px', marginRight: '5px' }}>Skip Width: </label>
                  <input type="number" id="barLabelSkipWidth" value={barChartLabelSkipWidth} onChange={(e) => setBarChartLabelSkipWidth(parseInt(e.target.value, 10))} style={{width: '50px'}}/>

                  <label htmlFor="barLabelSkipHeight" style={{ marginLeft: '10px', marginRight: '5px' }}>Skip Height: </label>
                  <input type="number" id="barLabelSkipHeight" value={barChartLabelSkipHeight} onChange={(e) => setBarChartLabelSkipHeight(parseInt(e.target.value, 10))} style={{width: '50px'}}/>
                </div>
                {barChartIndexBy && barChartKeys.length > 0 && (
                  <div style={{ height: barChartHeight, width: barChartWidth, marginTop: '10px' }}> {/* 차트 높이 및 너비는 부모 div에 의해 제어됨 */}
                    <ResponsiveBar
                      data={tasks.map(task => {
                        const item: { [key: string]: any } = {
                          [barChartIndexBy]: getTaskValue(task, barChartIndexBy)
                        };
                        barChartKeys.forEach(yKey => {
                          item[yKey] = getTaskValue(task, yKey);
                        });
                        return item;
                      })}
                      indexBy={barChartIndexBy}
                      layout={barChartLayout}
                      groupMode={barChartGroupMode}
                      // reverse={barChartReverse} // 'reverse' prop is directly on ResponsiveBar
                      keys={barChartKeys}
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }} // 기본 마진으로 복원 또는 조정
                      padding={barChartPadding}
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={{ scheme: 'nivo' }}
                      // borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }} // 단순화를 위해 제거 또는 주석 처리
                      axisTop={barChartShowAxisTop ? { legend: 'Top Axis (optional)' } : null}
                      axisRight={barChartShowAxisRight ? { legend: 'Right Axis (optional)' } : null}
                      axisBottom={barChartShowAxisBottom ? {
                        legend: barChartLayout === 'horizontal' ? barChartKeys.join(', ') : barChartIndexBy,
                        legendPosition: 'middle',
                        legendOffset: 32,
                        // tickSize, tickPadding, tickRotation 등은 기본값 사용
                      } : null}
                      axisLeft={barChartShowAxisLeft ? {
                        legend: barChartLayout === 'horizontal' ? barChartIndexBy : barChartKeys.join(', '),
                        legendPosition: 'middle',
                        legendOffset: -40,
                        // tickSize, tickPadding, tickRotation 등은 기본값 사용
                      } : null}
                      enableGridX={barChartEnableGridX}
                      enableGridY={barChartEnableGridY}
                      enableLabel={barChartEnableLabel}
                      labelSkipWidth={barChartLabelSkipWidth}
                      labelSkipHeight={barChartLabelSkipHeight}
                      // labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                      // legends={[]} // 범례를 비활성화하거나 기본값 사용
                      // animate={true} // 애니메이션 비활성화 또는 기본값 사용
                    />
                  </div>
                )}
              </div>

              {/* --- Line Chart Configuration & Display --- */}
              <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
                <h4>Line Chart (<code>@nivo/line</code>)</h4>
                <div>
                  <label htmlFor="lineXKey">X-axis Key: </label>
                  <select id="lineXKey" value={lineChartXKey} onChange={(e) => setLineChartXKey(e.target.value)}>
                    <option value="">-- Select X-axis --</option>
                    {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="lineYKeys">Y-axis Key(s): </label>
                  {/* For simplicity, allowing one Y key for now. Can be extended to multi-select */}
                  <select id="lineYKeys" value={lineChartYKeys[0] || ''} onChange={(e) => setLineChartYKeys(e.target.value ? [e.target.value] : [])}>
                    <option value="">-- Select Y-axis --</option>
                    {Array.from(confirmedTaskColumnKeys).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
                {lineChartXKey && lineChartYKeys.length > 0 && (
                  <div style={{ height: '400px', marginTop: '10px' }}>
                    <ResponsiveLine
                      data={lineChartYKeys.map(yKey => ({
                        id: yKey,
                        data: tasks.map((task, index) => ({
                          x: getTaskValue(task, lineChartXKey) ?? index, // Fallback to index if xKey value is null/undefined
                          y: getTaskValue(task, yKey)
                        })).filter(p => p.y !== undefined && p.y !== null) // Filter out points with no y value
                      }))}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: 'point' }} // or 'time' if xKey is date and properly formatted
                      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        // tickSize: 5,
                        // tickPadding: 5,
                        // tickRotation: 0,
                        legend: lineChartXKey,
                        legendOffset: 36,
                        legendPosition: 'middle'
                      }}
                      axisLeft={{
                        // tickSize: 5,
                        // tickPadding: 5,
                        // tickRotation: 0,
                        legend: lineChartYKeys.join(', '),
                        legendOffset: -40,
                        legendPosition: 'middle'
                      }}
                      // pointSize={10}
                      // pointColor={{ theme: 'background' }}
                      // pointBorderWidth={2}
                      // pointBorderColor={{ from: 'serieColor' }}
                      // pointLabelYOffset={-12}
                      // useMesh={true} // 메시 사용 비활성화 또는 기본값 사용
                      // legends={[]} // 범례를 비활성화하거나 기본값 사용
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default MakeWidget01;