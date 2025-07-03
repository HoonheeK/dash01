import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine, LineSeries } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ColorSchemeId } from '@nivo/colors';
import { Task } from '../services/api';

interface ChartDisplayProps {
  chartType: 'bar' | 'line' | 'pie';

  // Bar Chart Props
  tasks: Task[];
  getTaskValue: (task: Task, key: string) => any;
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

  // Line Chart Props
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
  lineChartColorsScheme: ColorSchemeId;
  lineChartWidth: number;
  lineChartHeight: number;
  lineChartEnableGridX: boolean;
  lineChartEnableGridY: boolean;

  // Pie Chart Props
  pieChartIdKey: string;
  pieChartValueKey: string;
  pieChartInnerRadius: number;
  pieChartPadAngle: number;
  pieChartCornerRadius: number;
  pieChartColorsScheme: ColorSchemeId;
  pieChartBorderWidth: number;
  pieChartBorderColor: string;
  pieChartEnableArcLabels: boolean;
  pieChartArcLabel: string;
  pieChartArcLabelSkipAngle: number;
  pieChartArcLabelTextColor: string;
  pieChartEnableArcLinkLabels: boolean;
  pieChartArcLinkLabel: string;
  pieChartArcLinkLabelsSkipAngle: number;
  pieChartArcLinkLabelsTextColor: string;
  pieChartStartAngle: number;
  pieChartEndAngle: number;
  pieChartSortByValue: boolean;
  pieChartIsInteractive: boolean;
  pieChartRole: string;
  pieChartMarginTop: number;
  pieChartMarginRight: number;
  pieChartMarginBottom: number;
  pieChartMarginLeft: number;
  pieChartWidth: number;
  pieChartHeight: number;
}


const ChartDisplay: React.FC<ChartDisplayProps> = (props) => {
  // getLineChartData, getPieChartData 함수는 ChartConfigurator에서 사용하던 것과 동일하게 복사
  const getLineChartData = (): LineSeries[] => {
    const {
      lineChartXKey, lineChartYKeys, tasks, getTaskValue,
    } = props;
    if (!lineChartXKey || lineChartYKeys.length === 0 || tasks.length === 0) {
      return [];
    }
    let processedTasks = [...tasks].sort((a, b) => {
      const valA = getTaskValue(a, lineChartXKey);
      const valB = getTaskValue(b, lineChartXKey);
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    return lineChartYKeys.map(yKey => {
      const seriesData = processedTasks
        .map(task => {
          const xValue = getTaskValue(task, lineChartXKey);
          const yValue = getTaskValue(task, yKey);
          const numericYValue = yValue !== null && yValue !== undefined && !isNaN(Number(yValue)) ? Number(yValue) : null;
          if (xValue !== null && xValue !== undefined && numericYValue !== null) {
            return { x: xValue, y: numericYValue };
          }
          return null;
        })
        .filter((d): d is { x: string | number; y: number } => d !== null);
      return {
        id: yKey,
        data: seriesData,
      };
    });
  };

  const getPieChartData = () => {
    const {
      pieChartIdKey, pieChartValueKey, tasks, getTaskValue,
    } = props;
    if (!pieChartIdKey || tasks.length === 0) {
      return [];
    }
    const aggregatedData: { [key: string]: { id: string | number; value: number } } = {};
    tasks.forEach(task => {
      const idValue = getTaskValue(task, pieChartIdKey);
      if (idValue !== undefined && idValue !== null) {
        const key = String(idValue);
        if (!aggregatedData[key]) {
          aggregatedData[key] = { id: idValue, value: 0 };
        }
        if (pieChartValueKey) {
          const rawValue = getTaskValue(task, pieChartValueKey);
          const numericValue = rawValue !== null && rawValue !== undefined && !isNaN(Number(rawValue)) ? Number(rawValue) : 0;
          aggregatedData[key].value += numericValue;
        } else {
          aggregatedData[key].value += 1;
        }
      }
    });
    return Object.values(aggregatedData);
  };

  // 차트 표시부만 렌더링
  if (props.chartType === 'bar' && props.barChartIndexBy && props.barChartKeys.length > 0) {
    return (
      <div style={{ height: props.barChartHeight, width: props.barChartWidth }}>
        <ResponsiveBar
          data={props.tasks.map(task => {
            const item: { [key: string]: any } = {
              [props.barChartIndexBy]: props.getTaskValue(task, props.barChartIndexBy)
            };
            props.barChartKeys.forEach(yKey => {
              item[yKey] = props.getTaskValue(task, yKey);
            });
            return item;
          })}
          indexBy={props.barChartIndexBy}
          layout={props.barChartLayout}
          groupMode={props.barChartGroupMode}
          keys={props.barChartKeys}
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={props.barChartPadding}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          axisTop={props.barChartShowAxisTop ? { legend: 'Top Axis (optional)' } : null}
          axisRight={props.barChartShowAxisRight ? { legend: 'Right Axis (optional)' } : null}
          axisBottom={props.barChartShowAxisBottom ? {
            legend: props.barChartLayout === 'horizontal' ? props.barChartKeys.join(', ') : props.barChartIndexBy,
            legendPosition: 'middle',
            legendOffset: 32,
          } : null}
          axisLeft={props.barChartShowAxisLeft ? {
            legend: props.barChartLayout === 'horizontal' ? props.barChartIndexBy : props.barChartKeys.join(', '),
            legendPosition: 'middle',
            legendOffset: -40,
          } : null}
          enableGridX={props.barChartEnableGridX}
          enableGridY={props.barChartEnableGridY}
          enableLabel={props.barChartEnableLabel}
          labelSkipWidth={props.barChartLabelSkipWidth}
          labelSkipHeight={props.barChartLabelSkipHeight}
        />
      </div>
    );
  }

  if (props.chartType === 'line' && props.lineChartXKey && props.lineChartYKeys.length > 0) {
    return (
      <div style={{ height: props.lineChartHeight, width: props.lineChartWidth }}>
        <ResponsiveLine
          data={getLineChartData()}
          margin={{
            top: props.lineChartMarginTop,
            right: props.lineChartMarginRight,
            bottom: props.lineChartMarginBottom,
            left: props.lineChartMarginLeft
          }}
          xScale={{ type: props.lineChartXScaleType, min: 'auto', max: 'auto' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: props.lineChartXKey,
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: props.lineChartYKeys.join(', '),
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          enableGridX={props.lineChartEnableGridX}
          enableGridY={props.lineChartEnableGridY}
          colors={{ scheme: props.lineChartColorsScheme }}
          lineWidth={props.lineChartLineWidth}
          enablePoints={props.lineChartEnablePoints}
          pointSize={props.lineChartPointSize}
          pointColor={props.lineChartUseThemeBackgroundForPointColor ? { theme: 'background' } : props.lineChartCustomPointColor}
          pointBorderWidth={props.lineChartPointBorderWidth}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={props.lineChartPointLabelYOffset}
          enableArea={props.lineChartEnableArea}
          areaOpacity={props.lineChartAreaOpacity}
          useMesh={props.lineChartUseMesh}
          legends={[]}
        />
      </div>
    );
  }

  if (props.chartType === 'pie' && props.pieChartIdKey && getPieChartData().length > 0) {
    return (
      <div style={{ height: props.pieChartHeight, width: props.pieChartWidth }}>
        <ResponsivePie
          data={getPieChartData()}
          margin={{
            top: props.pieChartMarginTop,
            right: props.pieChartMarginRight,
            bottom: props.pieChartMarginBottom,
            left: props.pieChartMarginLeft
          }}
          innerRadius={props.pieChartInnerRadius}
          padAngle={props.pieChartPadAngle}
          cornerRadius={props.pieChartCornerRadius}
          startAngle={props.pieChartStartAngle}
          endAngle={props.pieChartEndAngle}
          sortByValue={props.pieChartSortByValue}
          colors={{ scheme: props.pieChartColorsScheme }}
          borderWidth={props.pieChartBorderWidth}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          enableArcLabels={props.pieChartEnableArcLabels}
          arcLabel={props.pieChartArcLabel}
          arcLabelsSkipAngle={props.pieChartArcLabelSkipAngle}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          enableArcLinkLabels={props.pieChartEnableArcLinkLabels}
          arcLinkLabel={props.pieChartArcLinkLabel}
          arcLinkLabelsSkipAngle={props.pieChartArcLinkLabelsSkipAngle}
          arcLinkLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          isInteractive={props.pieChartIsInteractive}
          role={props.pieChartRole}
          legends={[{
            anchor: 'bottom-right', direction: 'column', justify: false, translateX: 100, translateY: 0, itemsSpacing: 0, itemDirection: 'left-to-right', itemWidth: 80, itemHeight: 20, itemOpacity: 0.75, symbolSize: 12, symbolShape: 'circle', symbolBorderColor: 'rgba(0, 0, 0, .5)', effects: [{ on: 'hover', style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 } }]
          }]}
        />
      </div>
    );
  }

  return null;
};

export default ChartDisplay;