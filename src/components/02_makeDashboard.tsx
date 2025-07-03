import React, { useState, useEffect, useRef } from 'react';
import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, DragOverlay, rectIntersection, MeasuringStrategy, CollisionDetection } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Task, getTasksForProject } from '../services/api'; // Task 및 getTasksForProject import
import ChartConfigurator from './ChartConfigurator'; // ChartConfigurator import
import ChartDisplay from './ChartDisplay'; // ChartDisplay import 추가
import { CSS } from '@dnd-kit/utilities';
import { ColorSchemeId } from '@nivo/colors'; // ColorSchemeId import

// LocalStorage에 저장된 위젯 설정 타입
interface SavedWidgetConfig {
    widgetName: string;
    chartType: 'bar' | 'line' | 'pie'; // 위젯이 사용할 차트 타입 정의 (Nivo에 맞게 변경)
    projectId: string; // 프로젝트 ID 추가
    projectName: string; // 프로젝트 이름 추가
    confirmedTaskColumnKeys: string[]; // 확정된 Task 컬럼 키 (배열로 저장)

    // Bar Chart Configs (from ChartConfiguratorProps)
    barChartIndexBy: string;
    barChartKeys: string[];
    barChartLayout: 'vertical' | 'horizontal';
    barChartGroupMode: 'stacked' | 'grouped';
    barChartReverse: boolean;
    barChartPadding: number;
    barChartShowAxisTop: boolean;
    barChartShowAxisRight: boolean;
    barChartShowAxisBottom: boolean;
    barChartShowAxisLeft: boolean;
    barChartEnableGridX: boolean;
    barChartEnableGridY: boolean;
    barChartEnableLabel: boolean;
    barChartLabelSkipWidth: number;
    barChartLabelSkipHeight: number;
    barChartWidth: number;
    barChartHeight: number;

    // Line Chart Configs (from ChartConfiguratorProps)
    lineChartEnableGridX: boolean;
    lineChartEnableGridY: boolean;
    lineChartXKey: string;
    lineChartYKeys: string[];
    lineChartCurve: 'linear' | 'cardinal' | 'step' | 'monotoneX';
    lineChartEnablePoints: boolean;
    lineChartPointSize: number;
    lineChartEnableArea: boolean;
    lineChartLineWidth: number;
    lineChartPointBorderWidth: number;
    lineChartPointLabel: string;
    lineChartPointLabelYOffset: number;
    lineChartUseThemeBackgroundForPointColor: boolean;
    lineChartCustomPointColor: string;
    lineChartAreaOpacity: number;
    lineChartUseMesh: boolean;
    lineChartXScaleType: 'point' | 'linear';
    lineChartMarginTop: number;
    lineChartMarginRight: number;
    lineChartMarginBottom: number;
    lineChartMarginLeft: number;
    lineChartColorsScheme: ColorSchemeId; // ColorSchemeId
    lineChartWidth: number;
    lineChartHeight: number;

    // Pie Chart Configs (from ChartConfiguratorProps)
    pieChartStartAngle: number;
    pieChartEndAngle: number;
    pieChartSortByValue: boolean;
    pieChartIsInteractive: boolean;
    pieChartRole: string;
    pieChartMarginTop: number;
    pieChartMarginRight: number;
    pieChartMarginBottom: number;
    pieChartMarginLeft: number;
    pieChartEnableArcLinkLabels: boolean;
    pieChartArcLinkLabel: string;
    pieChartArcLinkLabelsSkipAngle: number;
    pieChartArcLinkLabelsTextColor: string;
    pieChartIdKey: string;
    pieChartValueKey: string;
    pieChartInnerRadius: number;
    pieChartPadAngle: number;
    pieChartCornerRadius: number;
    pieChartColorsScheme: ColorSchemeId; // ColorSchemeId
    pieChartBorderWidth: number;
    pieChartBorderColor: string;
    pieChartEnableArcLabels: boolean;
    pieChartArcLabel: string;
    pieChartArcLabelSkipAngle: number;
    pieChartArcLabelTextColor: string;
    pieChartWidth: number;
    pieChartHeight: number;
}

// 대시보드 캔버스에 배치된 위젯 인스턴스 타입
interface DashboardWidget extends SavedWidgetConfig {
    id: string; // 캔버스 위젯의 고유 ID
    top: number; // 위치
    left: number; // 위치
    tasks?: Task[]; // 이 위젯 인스턴스에 대한 Task 데이터
}

// --- ContextMenu Component ---
interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onDelete: () => void;
    onModify: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onDelete, onModify }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // 오른쪽 클릭(button === 2)에 대해서는 메뉴 닫기 로직을 실행하지 않음
                if (event.button === 2) {
                    return;
                }
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const menuStyle: React.CSSProperties = {
        position: 'absolute',
        top: y,
        left: x,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: '120px',
        padding: '5px 0',
    };

    const menuItemStyle: React.CSSProperties = {
        padding: '8px 15px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    };

    const handleMenuItemClick = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div ref={menuRef} style={menuStyle}>
            <div style={menuItemStyle} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')} onClick={() => handleMenuItemClick(onModify)}>Modify</div>
            <div style={menuItemStyle} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')} onClick={() => handleMenuItemClick(onDelete)}>Delete</div>
        </div>
    );
};

// --- Draggable Widget in the List (dnd-kit 버전) ---
interface DraggableWidgetProps {
    config: SavedWidgetConfig;
    onContextMenu: (event: React.MouseEvent, config: SavedWidgetConfig) => void;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ config, onContextMenu }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `list-widget-${config.widgetName}`,
        data: { type: 'listWidget', config: config },
    });
    return (
        <div
            ref={setNodeRef}
            style={{
                padding: '8px',
                margin: '0 0 8px 0',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'grab',
                opacity: isDragging ? 0.4 : 1,
            }}
            onContextMenu={(e) => onContextMenu(e, config)} // Add onContextMenu handler
            {...listeners}
            {...attributes}
        >
            {config.widgetName}
        </div>
    );
};

// --- Widget on the Canvas ---
interface CanvasWidgetProps {
    widget: DashboardWidget;
    getTaskValue: (task: Task, key: string) => any;
}

const CanvasWidget: React.FC<CanvasWidgetProps> = ({ widget, getTaskValue }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: widget.id,
        data: { type: 'canvasWidget', widget: widget },
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        top: widget.top,
        left: widget.left,
        width: widget.barChartWidth || widget.lineChartWidth || widget.pieChartWidth || 400,
        height: widget.barChartHeight || widget.lineChartHeight || widget.pieChartHeight || 300,
        border: '1px dashed #3498db',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        cursor: 'grab',
        boxSizing: 'border-box',
        transform: isDragging ? CSS.Transform.toString(transform) : undefined,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            <div style={{ padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #eee', height: '25px', boxSizing: 'border-box' }}>
                {widget.widgetName}
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 25px)', position: 'relative' }}>
                {widget.tasks ? (
                    <ChartDisplay
                        chartType={widget.chartType}
                        tasks={widget.tasks}
                        getTaskValue={getTaskValue}
                        // Bar Chart Props
                        barChartIndexBy={widget.barChartIndexBy}
                        barChartKeys={widget.barChartKeys}
                        barChartLayout={widget.barChartLayout}
                        barChartGroupMode={widget.barChartGroupMode}
                        barChartReverse={widget.barChartReverse}
                        barChartPadding={widget.barChartPadding}
                        barChartShowAxisTop={widget.barChartShowAxisTop}
                        barChartShowAxisRight={widget.barChartShowAxisRight}
                        barChartShowAxisBottom={widget.barChartShowAxisBottom}
                        barChartShowAxisLeft={widget.barChartShowAxisLeft}
                        barChartEnableGridX={widget.barChartEnableGridX}
                        barChartEnableGridY={widget.barChartEnableGridY}
                        barChartEnableLabel={widget.barChartEnableLabel}
                        barChartLabelSkipWidth={widget.barChartLabelSkipWidth}
                        barChartLabelSkipHeight={widget.barChartLabelSkipHeight}
                        barChartWidth={widget.barChartWidth}
                        barChartHeight={widget.barChartHeight - 25}
                        // Line Chart Props
                        lineChartEnableGridX={widget.lineChartEnableGridX}
                        lineChartEnableGridY={widget.lineChartEnableGridY}
                        lineChartXKey={widget.lineChartXKey}
                        lineChartYKeys={widget.lineChartYKeys}
                        lineChartCurve={widget.lineChartCurve}
                        lineChartEnablePoints={widget.lineChartEnablePoints}
                        lineChartPointSize={widget.lineChartPointSize}
                        lineChartEnableArea={widget.lineChartEnableArea}
                        lineChartLineWidth={widget.lineChartLineWidth}
                        lineChartPointBorderWidth={widget.lineChartPointBorderWidth}
                        lineChartPointLabel={widget.lineChartPointLabel}
                        lineChartPointLabelYOffset={widget.lineChartPointLabelYOffset}
                        lineChartUseThemeBackgroundForPointColor={widget.lineChartUseThemeBackgroundForPointColor}
                        lineChartCustomPointColor={widget.lineChartCustomPointColor}
                        lineChartAreaOpacity={widget.lineChartAreaOpacity}
                        lineChartUseMesh={widget.lineChartUseMesh}
                        lineChartXScaleType={widget.lineChartXScaleType}
                        lineChartMarginTop={widget.lineChartMarginTop}
                        lineChartMarginRight={widget.lineChartMarginRight}
                        lineChartMarginBottom={widget.lineChartMarginBottom}
                        lineChartMarginLeft={widget.lineChartMarginLeft}
                        lineChartColorsScheme={widget.lineChartColorsScheme}
                        lineChartWidth={widget.lineChartWidth}
                        lineChartHeight={widget.lineChartHeight - 25}
                        // Pie Chart Props
                        pieChartStartAngle={widget.pieChartStartAngle}
                        pieChartEndAngle={widget.pieChartEndAngle}
                        pieChartSortByValue={widget.pieChartSortByValue}
                        pieChartIsInteractive={widget.pieChartIsInteractive}
                        pieChartRole={widget.pieChartRole}
                        pieChartMarginTop={widget.pieChartMarginTop}
                        pieChartMarginRight={widget.pieChartMarginRight}
                        pieChartMarginBottom={widget.pieChartMarginBottom}
                        pieChartMarginLeft={widget.pieChartMarginLeft}
                        pieChartEnableArcLinkLabels={widget.pieChartEnableArcLinkLabels}
                        pieChartArcLinkLabel={widget.pieChartArcLinkLabel}
                        pieChartArcLinkLabelsSkipAngle={widget.pieChartArcLinkLabelsSkipAngle}
                        pieChartArcLinkLabelsTextColor={widget.pieChartArcLinkLabelsTextColor}
                        pieChartIdKey={widget.pieChartIdKey}
                        pieChartValueKey={widget.pieChartValueKey}
                        pieChartInnerRadius={widget.pieChartInnerRadius}
                        pieChartPadAngle={widget.pieChartPadAngle}
                        pieChartCornerRadius={widget.pieChartCornerRadius}
                        pieChartColorsScheme={widget.pieChartColorsScheme}
                        pieChartBorderWidth={widget.pieChartBorderWidth}
                        pieChartBorderColor={widget.pieChartBorderColor}
                        pieChartEnableArcLabels={widget.pieChartEnableArcLabels}
                        pieChartArcLabel={widget.pieChartArcLabel}
                        pieChartArcLabelSkipAngle={widget.pieChartArcLabelSkipAngle}
                        pieChartArcLabelTextColor={widget.pieChartArcLabelTextColor}
                        pieChartWidth={widget.pieChartWidth}
                        pieChartHeight={widget.pieChartHeight - 25}
                    />
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                        Loading chart data...
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Dashboard Component (Presentational) ---
interface MakeDashboardComponentProps {
    savedWidgets: SavedWidgetConfig[];
    dashboardWidgets: DashboardWidget[];
    activeId: string | null;
    activeWidget: SavedWidgetConfig | DashboardWidget | null;
    getTaskValue: (task: Task, key: string) => any; // Helper function passed down
    onWidgetContextMenu: (event: React.MouseEvent, config: SavedWidgetConfig) => void; // Add this prop
    canvasRef: React.RefObject<HTMLDivElement | null>; // useRef(null)로 초기화되므로 null을 허용해야 합니다.
}

const MakeDashboardComponent: React.FC<MakeDashboardComponentProps> = ({
    savedWidgets,
    dashboardWidgets,
    activeId,
    activeWidget,
    getTaskValue, // getTaskValue prop 추가
    onWidgetContextMenu, // Destructure the new prop
    canvasRef,
}) => {
    // dnd-kit의 useDroppable 훅은 DndContext 내에서 호출되어야 합니다.
    // 이 컴포넌트는 DndContext의 자식이므로 여기에 배치하는 것이 올바릅니다.
    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: 'dashboard-canvas',
    });

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', fontFamily: 'sans-serif' }}>
            {/* 위젯 목록 패널 (너비를 vw에서 px로 변경하여 일관성 유지) */}
            <div style={{ // 너비를 vw에서 px로 변경하여 일관성 유지
                width: '20vw',
                borderRight: '1px solid #ccc',
                padding: '10px',
                overflowY: 'auto',
                background: '#f9f9f9'
            }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Saved Widgets</h3>
                {savedWidgets.length > 0 ? (
                    <div>
                        {savedWidgets.map((widget, index) => ( // Pass the handler down
                            <DraggableWidget key={`${widget.widgetName}-${index}`} config={widget} onContextMenu={onWidgetContextMenu} />
                        ))}
                    </div>
                ) : (
                    <p>No saved widgets found in LocalStorage.</p>
                )}
            </div>

            {/* 캔버스 패널 */}
            <div
                id="dashboard-canvas" // 개발자 도구에서 쉽게 찾을 수 있도록 id 속성 추가
                ref={node => {
                    setDroppableNodeRef(node); // dnd-kit의 droppable ref 연결
                    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node; // 기존 ref도 유지
                }}
                style={{
                    flex: 1,
                    minHeight: '500px',
                    minWidth: '500px',
                    position: 'relative',
                    background: '#e9e9e9',
                    backgroundImage: 'radial-gradient(#d7d7d7 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                }}
            >
                {dashboardWidgets.map(widget => (
                    <CanvasWidget key={widget.id} widget={widget} getTaskValue={getTaskValue} />
                ))}
            </div>

            {/* 드래그 오버레이: 드래그 중인 요소의 시각적 표현 */}
            <DragOverlay>
                {activeId && activeWidget ? (
                    <div
                        style={{ // 실제 위젯의 크기를 반영하도록 스타일 수정
                            width: activeWidget.barChartWidth || activeWidget.lineChartWidth || activeWidget.pieChartWidth || 400,
                            height: activeWidget.barChartHeight || activeWidget.lineChartHeight || activeWidget.pieChartHeight || 300,
                            border: '1px dashed #3498db',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            cursor: 'grabbing',
                            boxSizing: 'border-box',
                            opacity: 0.8,
                            // 내용물을 간단하게 표시
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            padding: '10px',
                        }}
                    >
                        {activeWidget.widgetName}
                    </div>
                ) : null}
            </DragOverlay>
        </div>
    );
};

// --- Custom Collision Detection for Debugging ---
const customCollisionDetection: CollisionDetection = (args) => {
    // Log the rectangles that dnd-kit is using internally for its calculations.
    // This helps diagnose discrepancies between visual position and dnd-kit's understanding.
    console.log('--- Custom Collision Detection Frame ---');
    const draggableRect = args.collisionRect;
    if (draggableRect) {
        const { top, left, width, height } = draggableRect;
        console.log(`Internal Draggable Rect: T=${top.toFixed(2)}, L=${left.toFixed(2)}, R=${(left + width).toFixed(2)}, B=${(top + height).toFixed(2)}`);
    }

    const canvasRect = args.droppableRects.get('dashboard-canvas');
    if (canvasRect) {
        const { top, left, width, height } = canvasRect;
        console.log(`Internal Canvas Rect: T=${top.toFixed(2)}, L=${left.toFixed(2)}, R=${(left + width).toFixed(2)}, B=${(top + height).toFixed(2)}`);
    }

    // Use the standard rectIntersection algorithm to find collisions
    // We are just using this custom function to log the internal values.
    return rectIntersection(args);
};


// --- MakeDashboard (Container) ---
const MakeDashboard: React.FC = () => {
    const [savedWidgets, setSavedWidgets] = useState<SavedWidgetConfig[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; widgetName: string } | null>(null);
    const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Helper function to get value from task, handling nested keys
    const getTaskValue = (task: Task, key: string): any => {
        if (!key) return undefined;
        if (key.includes('.')) {
            const parts = key.split('.');
            let value: any = task;
            for (const part of parts) {
                if (value && typeof value === 'object' && part in value) { value = value[part]; } else { return undefined; }
            }
            return value;
        }
        return (task as any)[key];
    };

    // 마운트 시 LocalStorage에서 저장된 위젯 로드
    useEffect(() => {
        const widgetsRaw = localStorage.getItem('savedWidgets');
        if (widgetsRaw) {
            try {
                const parsedWidgets = JSON.parse(widgetsRaw);
                if (Array.isArray(parsedWidgets)) {
                    setSavedWidgets(parsedWidgets);
                }
            } catch (e) {
                // console.error("Failed to parse saved widgets from LocalStorage", e);
            }
        }
    }, []);

    // dnd-kit 센서 설정
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1, // 8px 이동해야 드래그 시작으로 인식
            },
        })
    );

    const handleWidgetContextMenu = (event: React.MouseEvent, config: SavedWidgetConfig) => {
        event.preventDefault(); // Prevent default browser context menu
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            widgetName: config.widgetName,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleDeleteWidget = () => {
        if (contextMenu) {
            const widgetNameToDelete = contextMenu.widgetName;
            const updatedWidgets = savedWidgets.filter(w => w.widgetName !== widgetNameToDelete);
            localStorage.setItem('savedWidgets', JSON.stringify(updatedWidgets));
            setSavedWidgets(updatedWidgets); // Update state to re-render
            setContextMenu(null); // Close context menu
            // console.log(`Widget "${widgetNameToDelete}" deleted from LocalStorage.`);
        }
    };

    const handleDragStart = (event: any) => {
        // console.log("--- Drag Start ---");
        // console.log("Active item:", event.active);
        setActiveId(event.active.id);
    };

    const handleDragMove = (event: any) => {
        // 이 로그는 매우 자주 발생하지만, 움직임을 디버깅하는 데 유용합니다.
        // 필요 없을 때는 주석 처리할 수 있습니다.
        const { active } = event;
        const translatedRect = active.rect.current.translated;

        if (translatedRect) {
            const { top, left, width, height } = translatedRect;
            const right = left + width;
            const bottom = top + height;
            // DragOverlay의 현재 화면 좌표를 로그로 출력합니다.
            // console.log(`-- Drag Move -- Overlay Coords: T=${top.toFixed(2)}, L=${left.toFixed(2)}, R=${right.toFixed(2)}, B=${bottom.toFixed(2)}`);
        }
    };

    const handleDragOver = (event: any) => {
        // console.log(`- Drag Over - Draggable: ${event.active.id} is now over ${event.over?.id}`);
    };

    // 드래그 종료 시 호출되는 핸들러
    const handleDragEnd = (event: any) => {
        // console.log("--- Drag End ---");
        const { active, delta, over } = event; // delta는 드래그 시작점으로부터의 이동 거리

        setActiveId(null); // 드래그 종료 시 activeId 초기화

        // 드롭 영역 밖으로 드롭된 경우 무시
        if (!over) {
            // console.log(`Result: Dropped outside of any droppable area. Aborting because 'over' is null.`);
            const widgetRect = event.active.rect.current.translated;
            const canvasElement = canvasRef.current;
            if (widgetRect) {
                const { top, left, width, height } = widgetRect;
                const right = left + width;
                const bottom = top + height;
                // console.log(`Dropped Widget Coords: T=${top.toFixed(2)}, L=${left.toFixed(2)}, R=${right.toFixed(2)}, B=${bottom.toFixed(2)}`);
            }
            if (canvasElement) {
                const canvasRect = canvasElement.getBoundingClientRect();
                // const { top, left, right, bottom } = canvasRect;
                // console.log(`Canvas Coords: T=${top.toFixed(2)}, L=${left.toFixed(2)}, R=${right.toFixed(2)}, B=${bottom.toFixed(2)}`);
            }
            return;
        }

        const draggedItemData = active.data.current;
        // console.log("Final event state:", { active, over, delta });

        // 목록의 위젯을 캔버스 위로 드롭한 경우
        if (draggedItemData?.type === 'listWidget' && over.id === 'dashboard-canvas') {
            const config = draggedItemData.config as SavedWidgetConfig;
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            // 드래그 시작 시점의 요소 위치
            const initial = active.rect.current.initial;
            // console.log("Source: New widget from list. Initial position:", initial);
            if (!initial) return;

            const newLeft = Math.round(initial.left + delta.x - canvasRect.left);
            const newTop = Math.round(initial.top + delta.y - canvasRect.top);
            // console.log(`handleDragEnd - newLeft: ${newLeft}, newTop: ${newTop}`);
            
            // 새 위젯 객체 생성 (SavedWidgetConfig의 모든 속성을 포함)
            const newWidget: DashboardWidget = {
                ...config, // SavedWidgetConfig의 모든 속성을 복사
                id: `${config.widgetName}-${Date.now()}`,
                left: newLeft,
                top: newTop,
            };
            // console.log("Action: Adding new widget to dashboard.", newWidget);
            setDashboardWidgets(widgets => [...widgets, newWidget]);

            // 새 위젯에 대한 Task 데이터 가져오기
            getTasksForProject(config.projectId).then(tasks => {
                setDashboardWidgets(currentWidgets =>
                    currentWidgets.map(w => (w.id === newWidget.id ? { ...w, tasks } : w))
                );
                // console.log(`Post-Action: Tasks fetched and updated for widget '${newWidget.id}'.`);
            }).catch(error => console.error(`Failed to fetch tasks for project ${config.projectId}:`, error));
        } 
        // 캔버스 위의 기존 위젯을 이동하는 경우
        else if (draggedItemData?.type === 'canvasWidget' && over.id === 'dashboard-canvas') {
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            // 드래그 시작 시점의 위젯 위치 (dnd-kit이 측정)
            const initial = active.rect.current.initial;
            if (!initial) return;

            // 새 위젯을 추가할 때와 동일한 방식으로 캔버스에 상대적인 새 위치를 계산합니다.
            // 이 방식이 스크롤이나 캔버스 위치 변경에 더 안정적입니다.
            const newLeft = Math.round(initial.left + delta.x - canvasRect.left);
            const newTop = Math.round(initial.top + delta.y - canvasRect.top);

            // console.log(`Action: Moving existing widget '${active.id}' to new position { left: ${newLeft}, top: ${newTop} }`);
            setDashboardWidgets(widgets => widgets.map(w => (w.id === active.id ? { ...w, left: newLeft, top: newTop } : w)));
        }
    };

    const handleDragCancel = () => {
        // console.log("--- Drag Cancelled ---");
        setActiveId(null);
    };

    const handleModifyWidget = () => {
        // For now, do nothing as per requirement
        // console.log(`Modify action for widget "${contextMenu?.widgetName}" (not implemented yet).`);
        setContextMenu(null); // Close context menu
    };

    const activeWidget = activeId
        ? (dashboardWidgets.find(w => w.id === activeId) || savedWidgets.find(w => `list-widget-${w.widgetName}` === activeId)) ?? null
        : null;

    return (
        // DndContext는 sensors, collisionDetection, 이벤트 핸들러를 설정합니다.
        <DndContext
            sensors={sensors}
            //collisionDetection={rectIntersection} // 충돌 감지 전략을 다시 활성화합니다.
            collisionDetection={customCollisionDetection} // 디버깅을 위한 커스텀 충돌 감지 로직 사용
            measuring={{ // 측정 전략을 명시적으로 설정하여 좌표 계산 오류를 방지합니다.
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
            onDragStart={handleDragStart} // 드래그 시작 이벤트 핸들러
            onDragMove={handleDragMove}   // 드래그 이동 이벤트 핸들러
            onDragOver={handleDragOver}     // 드롭 영역 위로 이동 이벤트 핸들러
            onDragEnd={handleDragEnd} // 드래그 종료 이벤트 핸들러
            onDragCancel={handleDragCancel} // 드래그 취소 이벤트 핸들러
        >
            <MakeDashboardComponent
                savedWidgets={savedWidgets}
                dashboardWidgets={dashboardWidgets}
                activeId={activeId}
                activeWidget={activeWidget}
                getTaskValue={getTaskValue} // getTaskValue prop 전달
                onWidgetContextMenu={handleWidgetContextMenu} // Pass the handler
                canvasRef={canvasRef}
            />
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={handleCloseContextMenu}
                    onDelete={handleDeleteWidget}
                    onModify={handleModifyWidget}
                />
            )}
        </DndContext>
    );
};
export default MakeDashboard;
