import React, { useState, useRef } from 'react';
import { getProjects, Project, getTasksForProject, Task } from '../services/api'; // Task 관련 import 추가
import Handsontable from 'handsontable'; // Handsontable 코어 임포트
import { DateCellType } from 'handsontable/cellTypes';
import { HotTable, HotTableClass } from '@handsontable/react';
import ChartConfigurator from './ChartConfigurator'; // ChartConfigurator 컴포넌트 임포트
import { ColorSchemeId } from '@nivo/colors'; // ColorSchemeId 임포트
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
    display: 'flex', flexDirection: 'row',
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
  // Pie Chart States
  const [pieChartStartAngle, setPieChartStartAngle] = useState<number>(0);
  const [pieChartEndAngle, setPieChartEndAngle] = useState<number>(360);
  const [pieChartSortByValue, setPieChartSortByValue] = useState<boolean>(true);
  const [pieChartIsInteractive, setPieChartIsInteractive] = useState<boolean>(true);
  const [pieChartRole, setPieChartRole] = useState<string>('img');
  const [pieChartMarginTop, setPieChartMarginTop] = useState<number>(40);
  const [pieChartMarginRight, setPieChartMarginRight] = useState<number>(80);
  const [pieChartMarginBottom, setPieChartMarginBottom] = useState<number>(80);
  const [pieChartMarginLeft, setPieChartMarginLeft] = useState<number>(80);

  const [pieChartEnableArcLinkLabels, setPieChartEnableArcLinkLabels] = useState<boolean>(false);
  const [pieChartArcLinkLabel, setPieChartArcLinkLabel] = useState<string>('id');
  const [pieChartArcLinkLabelsSkipAngle, setPieChartArcLinkLabelsSkipAngle] = useState<number>(10);
  const [pieChartArcLinkLabelsTextColor, setPieChartArcLinkLabelsTextColor] = useState<string>('#333333');
  const [pieChartIdKey, setPieChartIdKey] = useState<string>('');
  const [pieChartValueKey, setPieChartValueKey] = useState<string>(''); // Optional: for summing values instead of counting
  const [pieChartInnerRadius, setPieChartInnerRadius] = useState<number>(0); // 0 to 1
  const [pieChartOuterRadius, setPieChartOuterRadius] = useState<number>(0.8); // 0 to 1
  const [pieChartPadAngle, setPieChartPadAngle] = useState<number>(0); // degrees
  const [pieChartCornerRadius, setPieChartCornerRadius] = useState<number>(0); // pixels
  const [pieChartColorsScheme, setPieChartColorsScheme] = useState<ColorSchemeId>('nivo');
  const [pieChartBorderWidth, setPieChartBorderWidth] = useState<number>(0);
  const [pieChartBorderColor, setPieChartBorderColor] = useState<string>('#ffffff'); // or { from: 'color', modifiers: [['darker', 0.2]] }
  const [pieChartEnableArcLabels, setPieChartEnableArcLabels] = useState<boolean>(true);
  const [pieChartArcLabel, setPieChartArcLabel] = useState<string>('value'); // 'id', 'value', 'formattedValue'
  const [pieChartArcLabelSkipAngle, setPieChartArcLabelSkipAngle] = useState<number>(10);
  const [pieChartArcLabelTextColor, setPieChartArcLabelTextColor] = useState<string>('#333333'); 
  const [pieChartWidth, setPieChartWidth] = useState<string>("94%");
  const [pieChartHeight, setPieChartHeight] = useState<number>(400);


  type WizardStep = 'project' | 'data' | 'chart' | 'save';
  const [currentStep, setCurrentStep] = useState<WizardStep>('project');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

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

  // Line Chart States
  const [lineChartWidth, setlineChartWidth] = useState<string>("94%");
  const [lineChartHeight, setlineChartHeight] = useState<number>(400);
  const [lineChartXKey, setLineChartXKey] = useState<string>('');
  const [lineChartYKeys, setLineChartYKeys] = useState<string[]>([]);
  const [lineChartCurve, setLineChartCurve] = useState<'linear' | 'cardinal' | 'step' | 'monotoneX'>('linear');
  const [lineChartEnablePoints, setLineChartEnablePoints] = useState<boolean>(true);
  const [lineChartPointSize, setLineChartPointSize] = useState<number>(8);
  const [lineChartEnableArea, setLineChartEnableArea] = useState<boolean>(false);
  const [lineChartLineWidth, setLineChartLineWidth] = useState<number>(2);
  const [lineChartPointBorderWidth, setLineChartPointBorderWidth] = useState<number>(2);
  const [lineChartPointLabel, setLineChartPointLabel] = useState<string>(''); // 'x', 'y', or ''
  const [lineChartPointLabelYOffset, setLineChartPointLabelYOffset] = useState<number>(-12);
  const [lineChartUseThemeBackgroundForPointColor, setLineChartUseThemeBackgroundForPointColor] = useState<boolean>(true);
  const [lineChartCustomPointColor, setLineChartCustomPointColor] = useState<string>('#ffffff');
  const [lineChartAreaOpacity, setLineChartAreaOpacity] = useState<number>(0.2);
  const [lineChartUseMesh, setLineChartUseMesh] = useState<boolean>(true);
  const [lineChartXScaleType, setLineChartXScaleType] = useState<'point' | 'linear'>('point');
  // Line Chart Margin States
  const [lineChartMarginTop, setLineChartMarginTop] = useState<number>(50);
  const [lineChartMarginRight, setLineChartMarginRight] = useState<number>(110);
  const [lineChartMarginBottom, setLineChartMarginBottom] = useState<number>(50);
  const [lineChartMarginLeft, setLineChartMarginLeft] = useState<number>(60);
  // Line Chart Colors State
  const [lineChartColorsScheme, setLineChartColorsScheme] = useState<ColorSchemeId>('nivo');
  const [lineChartEnableGridX, setLineChartEnableGridX] = useState<boolean>(false); // 기본적으로 X 그리드는 숨김
  const [lineChartEnableGridY, setLineChartEnableGridY] = useState<boolean>(true);

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
      setBarChartIndexBy('');
      setBarChartKeys([]);
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
    <div style={{ padding: '0px' }}>
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
        <ChartConfigurator
          tasks={tasks}
          confirmedTaskColumnKeys={confirmedTaskColumnKeys}
          getTaskValue={getTaskValue}
          chartType={chartType}
          setChartType={setChartType}
          // Bar Chart Props
          barChartIndexBy={barChartIndexBy}
          setBarChartIndexBy={setBarChartIndexBy}
          barChartKeys={barChartKeys}
          setBarChartKeys={setBarChartKeys}
          barChartLayout={barChartLayout}
          setBarChartLayout={setBarChartLayout}
          barChartGroupMode={barChartGroupMode}
          setBarChartGroupMode={setBarChartGroupMode}
          barChartReverse={barChartReverse}
          setBarChartReverse={setBarChartReverse}
          barChartPadding={barChartPadding}
          setBarChartPadding={setBarChartPadding}
          barChartShowAxisTop={barChartShowAxisTop}
          setBarChartShowAxisTop={setBarChartShowAxisTop}
          barChartShowAxisRight={barChartShowAxisRight}
          setBarChartShowAxisRight={setBarChartShowAxisRight}
          barChartShowAxisBottom={barChartShowAxisBottom}
          setBarChartShowAxisBottom={setBarChartShowAxisBottom}
          barChartShowAxisLeft={barChartShowAxisLeft}
          setBarChartShowAxisLeft={setBarChartShowAxisLeft}
          barChartEnableGridX={barChartEnableGridX}
          setBarChartEnableGridX={setBarChartEnableGridX}
          barChartEnableGridY={barChartEnableGridY}
          setBarChartEnableGridY={setBarChartEnableGridY}
          barChartEnableLabel={barChartEnableLabel}
          setBarChartEnableLabel={setBarChartEnableLabel}
          barChartLabelSkipWidth={barChartLabelSkipWidth}
          setBarChartLabelSkipWidth={setBarChartLabelSkipWidth}
          barChartLabelSkipHeight={barChartLabelSkipHeight}
          setBarChartLabelSkipHeight={setBarChartLabelSkipHeight}
          barChartWidth={barChartWidth}
          setBarChartWidth={setBarChartWidth}
          barChartHeight={barChartHeight}
          setBarChartHeight={setBarChartHeight}
          // Line Chart Props
          lineChartXKey={lineChartXKey}
          setLineChartXKey={setLineChartXKey}
          lineChartYKeys={lineChartYKeys}
          setLineChartYKeys={setLineChartYKeys}
          lineChartCurve={lineChartCurve}
          setLineChartCurve={setLineChartCurve}
          lineChartEnablePoints={lineChartEnablePoints}
          setLineChartEnablePoints={setLineChartEnablePoints}
          lineChartPointSize={lineChartPointSize}
          setLineChartPointSize={setLineChartPointSize}
          lineChartEnableArea={lineChartEnableArea}
          setLineChartEnableArea={setLineChartEnableArea}
          lineChartLineWidth={lineChartLineWidth}
          setLineChartLineWidth={setLineChartLineWidth}
          lineChartPointBorderWidth={lineChartPointBorderWidth}
          setLineChartPointBorderWidth={setLineChartPointBorderWidth}
          lineChartPointLabel={lineChartPointLabel}
          setLineChartPointLabel={setLineChartPointLabel}
          lineChartPointLabelYOffset={lineChartPointLabelYOffset}
          setLineChartPointLabelYOffset={setLineChartPointLabelYOffset}
          lineChartUseThemeBackgroundForPointColor={lineChartUseThemeBackgroundForPointColor}
          setLineChartUseThemeBackgroundForPointColor={setLineChartUseThemeBackgroundForPointColor}
          lineChartCustomPointColor={lineChartCustomPointColor}
          setLineChartCustomPointColor={setLineChartCustomPointColor}
          lineChartAreaOpacity={lineChartAreaOpacity}
          setLineChartAreaOpacity={setLineChartAreaOpacity}
          lineChartUseMesh={lineChartUseMesh}
          setLineChartUseMesh={setLineChartUseMesh}
          lineChartXScaleType={lineChartXScaleType}
          setLineChartXScaleType={setLineChartXScaleType}
          lineChartMarginTop={lineChartMarginTop}
          setLineChartMarginTop={setLineChartMarginTop}
          lineChartMarginRight={lineChartMarginRight}
          setLineChartMarginRight={setLineChartMarginRight}
          lineChartMarginBottom={lineChartMarginBottom}
          setLineChartMarginBottom={setLineChartMarginBottom}
          lineChartMarginLeft={lineChartMarginLeft}
          setLineChartMarginLeft={setLineChartMarginLeft}
          lineChartColorsScheme={lineChartColorsScheme}
          setLineChartColorsScheme={setLineChartColorsScheme}
          lineChartWidth={lineChartWidth}
          setLineChartWidth={setlineChartWidth}
          lineChartHeight={lineChartHeight}
          setLineChartHeight={setlineChartHeight}
          lineChartEnableGridX={lineChartEnableGridX}
          setLineChartEnableGridX={setLineChartEnableGridX}
          lineChartEnableGridY={lineChartEnableGridY}
          setLineChartEnableGridY={setLineChartEnableGridY}
          // Pie Chart Props
          pieChartIdKey={pieChartIdKey}
          setPieChartIdKey={setPieChartIdKey}
          pieChartValueKey={pieChartValueKey}
          setPieChartValueKey={setPieChartValueKey}
          pieChartInnerRadius={pieChartInnerRadius}
          setPieChartInnerRadius={setPieChartInnerRadius}
          pieChartOuterRadius={pieChartOuterRadius}
          setPieChartOuterRadius={setPieChartOuterRadius}
          pieChartPadAngle={pieChartPadAngle}
          setPieChartPadAngle={setPieChartPadAngle}
          pieChartCornerRadius={pieChartCornerRadius}
          setPieChartCornerRadius={setPieChartCornerRadius}
          pieChartColorsScheme={pieChartColorsScheme}
          setPieChartColorsScheme={setPieChartColorsScheme}
          pieChartBorderWidth={pieChartBorderWidth}
          setPieChartBorderWidth={setPieChartBorderWidth}
          pieChartBorderColor={pieChartBorderColor}
          setPieChartBorderColor={setPieChartBorderColor}
          pieChartEnableArcLabels={pieChartEnableArcLabels}
          setPieChartEnableArcLabels={setPieChartEnableArcLabels}
          pieChartArcLabel={pieChartArcLabel}
          setPieChartArcLabel={setPieChartArcLabel}
          pieChartArcLabelSkipAngle={pieChartArcLabelSkipAngle}
          setPieChartArcLabelSkipAngle={setPieChartArcLabelSkipAngle}
          pieChartArcLabelTextColor={pieChartArcLabelTextColor}
          setPieChartArcLabelTextColor={setPieChartArcLabelTextColor}
          pieChartStartAngle={pieChartStartAngle}
          setPieChartStartAngle={setPieChartStartAngle}
          pieChartEndAngle={pieChartEndAngle}
          setPieChartEndAngle={setPieChartEndAngle}
          pieChartSortByValue={pieChartSortByValue}
          setPieChartSortByValue={setPieChartSortByValue}
          pieChartIsInteractive={pieChartIsInteractive}
          setPieChartIsInteractive={setPieChartIsInteractive}
          pieChartRole={pieChartRole}
          setPieChartRole={setPieChartRole}
          pieChartMarginTop={pieChartMarginTop}
          setPieChartMarginTop={setPieChartMarginTop}
          pieChartMarginRight={pieChartMarginRight}
          setPieChartMarginRight={setPieChartMarginRight}
          pieChartMarginBottom={pieChartMarginBottom}
          setPieChartMarginBottom={setPieChartMarginBottom}
          pieChartMarginLeft={pieChartMarginLeft}
          setPieChartMarginLeft={setPieChartMarginLeft}
          pieChartEnableArcLinkLabels={pieChartEnableArcLinkLabels}
          setPieChartEnableArcLinkLabels={setPieChartEnableArcLinkLabels}
          pieChartArcLinkLabel={pieChartArcLinkLabel}
          setPieChartArcLinkLabel={setPieChartArcLinkLabel}
          pieChartArcLinkLabelsSkipAngle={pieChartArcLinkLabelsSkipAngle}
          setPieChartArcLinkLabelsSkipAngle={setPieChartArcLinkLabelsSkipAngle}
          pieChartArcLinkLabelsTextColor={pieChartArcLinkLabelsTextColor}
          setPieChartArcLinkLabelsTextColor={setPieChartArcLinkLabelsTextColor}
          pieChartWidth={pieChartWidth}
          setPieChartWidth={setPieChartWidth}
          pieChartHeight={pieChartHeight}
          setPieChartHeight={setPieChartHeight}
        />
      )}
    </div>
  );
};
export default MakeWidget01;